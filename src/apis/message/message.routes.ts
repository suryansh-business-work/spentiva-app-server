import express from 'express';
import {
  getAllMessagesController,
  getMessageCountController,
  createMessageController,
  deleteMessageController,
} from './message.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * Message Routes
 */

// GET /api/messages - Get all messages with optional filtering
router.get('/', authenticateMiddleware, getAllMessagesController);

// GET /api/messages/count - Get message count
router.get('/count', authenticateMiddleware, getMessageCountController);

// POST /api/messages - Create a new message
router.post('/', authenticateMiddleware, createMessageController);

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', authenticateMiddleware, deleteMessageController);

export default router;
