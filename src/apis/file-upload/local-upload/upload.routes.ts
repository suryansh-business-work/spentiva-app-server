import express from 'express';
import multer from 'multer';
import {
  uploadFileController,
  getFileController,
  getUserFilesController,
  deleteFileController,
} from './upload.controllers';
import { authenticateMiddleware } from '../../../middleware/auth.middleware';

const router = express.Router();

// Configure multer for file uploads with memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
});

/**
 * Upload Routes
 * All routes require authentication
 */

/**
 * @route   POST /api/upload
 * @desc    Upload single or multiple files
 * @access  Private
 */
router.post('/upload', authenticateMiddleware, upload.array('files', 10), uploadFileController);

/**
 * @route   GET /api/uploads/:id
 * @desc    Get file metadata by ID
 * @access  Private
 */
router.get('/uploads/:id', authenticateMiddleware, getFileController);

/**
 * @route   GET /api/uploads
 * @desc    Get all files for authenticated user
 * @access  Private
 */
router.get('/uploads', authenticateMiddleware, getUserFilesController);

/**
 * @route   DELETE /api/uploads/:id
 * @desc    Delete file by ID
 * @access  Private
 */
router.delete('/uploads/:id', authenticateMiddleware, deleteFileController);

export default router;
