import { Response } from 'express';
import { successResponse, errorResponse, badRequestResponse } from '../../../utils/response-object';
import uploadService from './upload.service';

/**
 * Upload File Controller
 * Handles single and multiple file uploads
 */
export const uploadFileController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    // Check if files are present
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return badRequestResponse(res, null, 'No files provided');
    }

    // Get base URL for constructing file URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Handle file upload
    const files = req.files as Express.Multer.File[];
    const uploadResults = await uploadService.uploadMultipleFiles(userId, files, baseUrl);

    // Format response
    const responseData = uploadResults.map(file => ({
      id: file._id,
      originalName: file.originalName,
      savedName: file.savedName,
      filePath: file.filePath,
      fileUrl: file.fileUrl,
      size: file.size,
      mimeType: file.mimeType,
      uploadedAt: file.uploadedAt,
    }));

    return successResponse(
      res,
      responseData,
      files.length > 1 ? 'Files uploaded successfully' : 'File uploaded successfully'
    );
  } catch (error: any) {
    console.error('Error in uploadFileController:', error);
    return errorResponse(res, { error: error.message }, 'File upload failed');
  }
};

/**
 * Get File Controller
 * Retrieves file metadata by ID
 */
export const getFileController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const fileId = req.params.id;

    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    const file = await uploadService.getFileById(fileId, userId);
    if (!file) {
      return badRequestResponse(res, null, 'File not found');
    }

    return successResponse(
      res,
      {
        id: file._id,
        originalName: file.originalName,
        savedName: file.savedName,
        filePath: file.filePath,
        fileUrl: file.fileUrl,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
      },
      'File retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error in getFileController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to retrieve file');
  }
};

/**
 * Get User Files Controller
 * Retrieves all files uploaded by the authenticated user
 */
export const getUserFilesController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    const files = await uploadService.getUserFiles(userId, limit, skip);
    const total = await uploadService.getUserFilesCount(userId);

    const responseData = files.map(file => ({
      id: file._id,
      originalName: file.originalName,
      savedName: file.savedName,
      filePath: file.filePath,
      fileUrl: file.fileUrl,
      size: file.size,
      mimeType: file.mimeType,
      uploadedAt: file.uploadedAt,
    }));

    return successResponse(
      res,
      {
        files: responseData,
        total,
        limit,
        skip,
      },
      'Files retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error in getUserFilesController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to retrieve files');
  }
};

/**
 * Delete File Controller
 * Deletes a file by ID
 */
export const deleteFileController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const fileId = req.params.id;

    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    const deleted = await uploadService.deleteFile(fileId, userId);
    if (!deleted) {
      return badRequestResponse(res, null, 'File not found');
    }

    return successResponse(res, null, 'File deleted successfully');
  } catch (error: any) {
    console.error('Error in deleteFileController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to delete file');
  }
};
