import express from 'express';
import {
  createTicketController,
  getAllTicketsController,
  getTicketByIdController,
  updateTicketStatusController,
  addAttachmentController,
  addUpdateController,
  deleteTicketController,
  getTicketStatsController,
} from './support.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';
import { requireAdminMiddleware } from '../../middleware/admin.middleware';

const router = express.Router();

/**
 * Support Ticket Routes
 * All routes require authentication
 */

/**
 * @route   POST /v1/api/support/tickets
 * @desc    Create a new support ticket
 * @access  Private
 */
router.post('/tickets', authenticateMiddleware, createTicketController);

/**
 * @route   GET /v1/api/support/tickets
 * @desc    Get all tickets (user's tickets or all tickets for admin)
 * @access  Private
 */
router.get('/tickets', authenticateMiddleware, getAllTicketsController);

/**
 * @route   GET /v1/api/support/tickets/stats
 * @desc    Get ticket statistics
 * @access  Private
 */
router.get('/tickets/stats', authenticateMiddleware, getTicketStatsController);

/**
 * @route   GET /v1/api/support/tickets/:ticketId
 * @desc    Get ticket by ID
 * @access  Private
 */
router.get('/tickets/:ticketId', authenticateMiddleware, getTicketByIdController);

/**
 * @route   PUT /v1/api/support/tickets/:ticketId/status
 * @desc    Update ticket status
 * @access  Private
 */
router.put('/tickets/:ticketId/status', authenticateMiddleware, updateTicketStatusController);

/**
 * @route   POST /v1/api/support/tickets/:ticketId/attachments
 * @desc    Add attachment to ticket
 * @access  Private
 */
router.post('/tickets/:ticketId/attachments', authenticateMiddleware, addAttachmentController);

/**
 * @route   POST /v1/api/support/tickets/:ticketId/updates
 * @desc    Add update message to ticket
 * @access  Private
 */
router.post('/tickets/:ticketId/updates', authenticateMiddleware, addUpdateController);

/**
 * @route   DELETE /v1/api/support/tickets/:ticketId
 * @desc    Delete ticket (admin only)
 * @access  Admin
 */
router.delete(
  '/tickets/:ticketId',
  authenticateMiddleware,
  requireAdminMiddleware,
  deleteTicketController
);

export default router;
