import { Response } from 'express';
import { errorResponse, successResponseArr } from '../../../utils/response-object';
import imagekitService from './imagekit.service';
import { convertWebMToMP4, isWebMFile } from '../../../utils/video-converter';

/**
 * ImageKit Upload Controller
 * Handles file upload requests and delegates to ImageKit service
 * Expects files to be parsed by multer middleware
 * Automatically converts WebM files to MP4 before upload
 */
const imageKitUpload = async (req: any, res: Response) => {
  try {
    console.log('req.file:', req.file);
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);

    // Multer places files in req.files when using upload.any() or upload.array()
    // or in req.file when using upload.single()
    let filesToUpload: any[] = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      filesToUpload = req.files;
    } else if (req.file) {
      filesToUpload = [req.file];
    }

    // Validate that we have files
    if (filesToUpload.length === 0) {
      return errorResponse(
        res,
        { error: 'No files provided' },
        'Files are required for upload. Make sure to send files in the request.'
      );
    }

    console.log(`Processing ${filesToUpload.length} file(s) for upload`);

    // Convert WebM files to MP4 before processing
    const processedFiles = await Promise.all(
      filesToUpload.map(async (file: any) => {
        const fileName = file.originalname;
        const fileBuffer = file.buffer;
        const mimeType = file.mimetype;

        // Check if file is WebM
        if (isWebMFile(fileName, mimeType)) {
          console.log(`Detected WebM file: ${fileName}. Converting to MP4...`);
          try {
            const converted = await convertWebMToMP4(fileBuffer, fileName);
            console.log(`Successfully converted ${fileName} to ${converted.fileName}`);
            return {
              originalname: converted.fileName,
              buffer: converted.buffer,
              mimetype: 'video/mp4',
              size: converted.buffer.length,
            };
          } catch (error: any) {
            console.error(`Failed to convert ${fileName}:`, error.message);
            // If conversion fails, upload original file
            console.log(`Uploading original WebM file: ${fileName}`);
            return file;
          }
        }

        // Return file as-is if not WebM
        return file;
      })
    );

    // Handle single file upload
    if (processedFiles.length === 1) {
      const file = processedFiles[0];
      const fileName = file.originalname;
      const fileBuffer = file.buffer;

      if (!fileBuffer || !fileName) {
        return errorResponse(res, { error: 'Invalid file data' }, 'File must have name and data');
      }

      console.log(`Uploading single file: ${fileName}`);
      const uploadResult = await imagekitService.uploadRawData(fileBuffer, fileName, '/suryansh');

      return successResponseArr(
        res,
        [
          {
            fileId: uploadResult.fileId,
            size: uploadResult.size,
            fileName: {
              actual: fileName,
              uploadedName: uploadResult.name,
            },
            filePath: {
              filePath: uploadResult.filePath,
              fileUrl: uploadResult.url,
              thumbnailUrl: uploadResult.thumbnailUrl,
            },
            fileType: uploadResult.fileType,
          },
        ],
        {},
        'File uploaded successfully'
      );
    }

    // Handle multiple file uploads
    console.log(`Uploading ${processedFiles.length} files`);
    const fileArray = processedFiles.map((file: any) => ({
      name: file.originalname,
      data: file.buffer,
    }));

    // Validate all files have required data
    for (const file of fileArray) {
      if (!file.name || !file.data) {
        return errorResponse(
          res,
          { error: 'Invalid file data' },
          'All files must have name and data'
        );
      }
    }

    const uploadResults = await imagekitService.uploadMultipleFiles(fileArray, '/suryansh');

    return successResponseArr(
      res,
      uploadResults.map(result => ({
        fileId: result.fileId,
        size: result.size,
        fileName: result.fileName,
        filePath: {
          filePath: result.filePath,
          fileUrl: result.url,
          thumbnailUrl: result.thumbnailUrl,
        },
        fileType: result.fileType,
      })),
      {},
      `${uploadResults.length} file(s) uploaded successfully`
    );
  } catch (error: any) {
    console.error('Error in imageKitUpload controller:', error);
    return errorResponse(res, { error: error.message }, 'File upload failed');
  }
};

export { imageKitUpload };
