import express from 'express';
import {
  getAllMessagesController,
  getMessageCountController,
  createMessageController,
  deleteMessageController,
} from './message.controllers';
import { authenticateToken } from '../auth/auth.routes';

const router = express.Router();

/**
 * Message Routes
 */

// GET /api/messages - Get all messages with optional filtering
router.get('/', authenticateToken, getAllMessagesController);

// GET /api/messages/count - Get message count
router.get('/count', authenticateToken, getMessageCountController);

// POST /api/messages - Create a new message
router.post('/', authenticateToken, createMessageController);

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', authenticateToken, deleteMessageController);

export default router;
