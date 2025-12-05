// Core Modules
import express from 'express';
import multer from 'multer';

// Controllers
import { imageKitUpload } from './imagekit.controllers';

// Configure multer for memory storage (ImageKit needs file buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Initialization
const router = express.Router();

// ImageKit upload route with multer middleware
// Supports both single file (upload.single('file')) and multiple files (upload.array('files'))
router.post('/imagekit/upload', upload.any(), imageKitUpload);

export default router;
