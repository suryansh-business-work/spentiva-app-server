import { Request, Response } from 'express';
import { errorResponse, successResponseArr } from '../../../utils/response-object';
import imagekitService from './imagekit.service';

/**
 * ImageKit Upload Controller
 * Handles file upload requests and delegates to ImageKit service
 */
const imageKitUpload = async (req: any, res: Response) => {
  try {
    // Validate that files are present
    if (!req?.files?.files) {
      return errorResponse(
        res,
        { error: 'No files provided' },
        'Files are required for upload'
      );
    }

    const files = req.files.files;

    // Handle single file upload
    if (!Array.isArray(files)) {
      const { name, data } = files;

      const uploadResult = await imagekitService.uploadRawData(
        data,
        name,
        '/suryansh'
      );

      return successResponseArr(
        res,
        [
          {
            fileId: uploadResult.fileId,
            size: uploadResult.size,
            fileName: {
              actual: name,
              uploadedName: uploadResult.name
            },
            filePath: {
              filePath: uploadResult.filePath,
              fileUrl: uploadResult.url,
              thumbnailUrl: uploadResult.thumbnailUrl
            },
            fileType: uploadResult.fileType
          }
        ],
        {},
        'File uploaded successfully'
      );
    }

    // Handle multiple file uploads
    const fileArray = files.map((file: any) => ({
      name: file.name,
      data: file.data
    }));

    const uploadResults = await imagekitService.uploadMultipleFiles(
      fileArray,
      '/suryansh'
    );

    return successResponseArr(
      res,
      uploadResults.map(result => ({
        fileId: result.fileId,
        size: result.size,
        fileName: result.fileName,
        filePath: {
          filePath: result.filePath,
          fileUrl: result.url,
          thumbnailUrl: result.thumbnailUrl
        },
        fileType: result.fileType
      })),
      {},
      'All files uploaded successfully'
    );
  } catch (error: any) {
    console.error('Error in imageKitUpload controller:', error);
    return errorResponse(
      res,
      { error: error.message },
      'File upload failed'
    );
  }
};

export { imageKitUpload };

