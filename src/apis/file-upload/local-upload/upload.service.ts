import fs from 'fs';
import path from 'path';
import { FileUploadModel, IFileUpload } from './upload.models';

/**
 * Upload Service
 * Handles file storage and metadata management
 */
class UploadService {
  private uploadsDir = 'uploads';

  /**
   * Ensure user directory exists
   */
  private ensureUserDirectory(userId: string): string {
    const userDir = path.join(this.uploadsDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    return userDir;
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_');
    return `${timestamp}-${sanitized}${ext}`;
  }

  /**
   * Upload a single file
   */
  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    baseUrl: string
  ): Promise<IFileUpload> {
    try {
      // Ensure directory exists
      const userDir = this.ensureUserDirectory(userId);

      // Generate unique filename
      const savedName = this.generateFileName(file.originalname);
      const filePath = path.join(userDir, savedName);
      const fileUrl = `${baseUrl}/uploads/${userId}/${savedName}`;

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Save metadata to database
      const fileRecord = new FileUploadModel({
        userId,
        originalName: file.originalname,
        savedName,
        filePath,
        fileUrl,
        size: file.size,
        mimeType: file.mimetype,
      });

      await fileRecord.save();
      return fileRecord;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    userId: string,
    files: Express.Multer.File[],
    baseUrl: string
  ): Promise<IFileUpload[]> {
    const uploadPromises = files.map(file => this.uploadFile(userId, file, baseUrl));
    return Promise.all(uploadPromises);
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string, userId: string): Promise<IFileUpload | null> {
    return FileUploadModel.findOne({ _id: fileId, userId });
  }

  /**
   * Get all files for a user
   */
  async getUserFiles(userId: string, limit: number = 50, skip: number = 0): Promise<IFileUpload[]> {
    return FileUploadModel.find({ userId }).sort({ uploadedAt: -1 }).limit(limit).skip(skip);
  }

  /**
   * Get total count of user files
   */
  async getUserFilesCount(userId: string): Promise<number> {
    return FileUploadModel.countDocuments({ userId });
  }

  /**
   * Delete file by ID
   */
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const file = await FileUploadModel.findOne({ _id: fileId, userId });
      if (!file) {
        return false;
      }

      // Delete from disk
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }

      // Delete from database
      await FileUploadModel.deleteOne({ _id: fileId, userId });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }
}

export default new UploadService();
