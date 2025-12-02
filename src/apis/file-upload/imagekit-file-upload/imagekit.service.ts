import imagekit from './imagekit.config';

/**
 * ImageKit Service - Handles file uploads and operations with ImageKit CDN
 */
class ImageKitService {
  /**
   * Upload a file to ImageKit (Multer file)
   * @param file - Multer file object
   * @param folder - Folder path in ImageKit (e.g., 'profile-photos')
   * @returns Promise with ImageKit upload response
   */
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads') {
    try {
      const uploadResult = await imagekit.upload({
        file: file.buffer, // File buffer from multer memory storage
        fileName: `${Date.now()}-${file.originalname}`,
        folder: folder,
        useUniqueFileName: true,
        tags: ['user-upload'],
      });

      console.log('✅ File uploaded to ImageKit:', uploadResult.url);

      return {
        fileId: uploadResult.fileId,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        name: uploadResult.name,
        filePath: uploadResult.filePath,
        size: uploadResult.size,
        fileType: uploadResult.fileType,
      };
    } catch (error: any) {
      console.error('❌ Error uploading to ImageKit:', error);
      throw new Error(`ImageKit upload failed: ${error.message}`);
    }
  }

  /**
   * Upload raw data (buffer or base64) to ImageKit
   * @param data - Buffer or base64 string
   * @param fileName - File name
   * @param folder - Folder path in ImageKit
   * @returns Promise with ImageKit upload response
   */
  async uploadRawData(data: Buffer | string, fileName: string, folder: string = 'uploads') {
    try {
      const uploadResult = await imagekit.upload({
        file: data,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true,
      });

      console.log('✅ Raw data uploaded to ImageKit:', uploadResult.url);

      return {
        fileId: uploadResult.fileId,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        name: uploadResult.name,
        filePath: uploadResult.filePath,
        size: uploadResult.size,
        fileType: uploadResult.fileType,
      };
    } catch (error: any) {
      console.error('❌ Error uploading raw data to ImageKit:', error);
      throw new Error(`ImageKit upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files to ImageKit
   * @param files - Array of file objects with name and data properties
   * @param folder - Folder path in ImageKit
   * @returns Promise with array of ImageKit upload responses
   */
  async uploadMultipleFiles(
    files: Array<{ name: string; data: Buffer }>,
    folder: string = 'uploads'
  ) {
    try {
      const uploadPromises = files.map(async file => {
        const uploadResult = await imagekit.upload({
          file: file.data,
          fileName: file.name,
          folder: folder,
          useUniqueFileName: true,
        });

        return {
          fileId: uploadResult.fileId,
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          name: uploadResult.name,
          filePath: uploadResult.filePath,
          size: uploadResult.size,
          fileType: uploadResult.fileType,
          fileName: {
            actual: file.name,
            uploadedName: uploadResult.name,
          },
        };
      });

      const results = await Promise.all(uploadPromises);
      console.log(`✅ ${results.length} files uploaded to ImageKit`);
      return results;
    } catch (error: any) {
      console.error('❌ Error uploading multiple files to ImageKit:', error);
      throw new Error(`ImageKit bulk upload failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from ImageKit
   * @param fileId - ImageKit file ID
   */
  async deleteFile(fileId: string) {
    try {
      await imagekit.deleteFile(fileId);
      console.log('✅ File deleted from ImageKit:', fileId);
      return true;
    } catch (error: any) {
      console.error('❌ Error deleting from ImageKit:', error);
      throw new Error(`ImageKit delete failed: ${error.message}`);
    }
  }

  /**
   * Get optimized file URL with transformations
   * @param filePath - File path in ImageKit
   * @param transformations - ImageKit transformation parameters
   */
  getFileUrl(filePath: string, transformations?: any) {
    try {
      const url = imagekit.url({
        path: filePath,
        transformation: transformations || [
          {
            height: '400',
            width: '400',
            crop: 'at_max',
            quality: '80',
          },
        ],
      });
      return url;
    } catch (error: any) {
      console.error('❌ Error generating ImageKit URL:', error);
      return filePath; // Return original path as fallback
    }
  }
}

export default new ImageKitService();
