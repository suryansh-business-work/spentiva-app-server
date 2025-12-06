import express from 'express';
import * as RefundController from './refund.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * @route   POST /v1/api/refund
 * @desc    Create a new refund
 * @access  Private
 */
router.post('/', authenticateMiddleware, RefundController.createRefundController);

/**
 * @route   GET /v1/api/refund/:refundId
 * @desc    Get refund by ID
 * @access  Private
 */
router.get('/:refundId', authenticateMiddleware, RefundController.getRefundByIdController);

/**
 * @route   GET /v1/api/refund/payment/:paymentId
 * @desc    Get refunds for a payment
 * @access  Private
 */
router.get(
  '/payment/:paymentId',
  authenticateMiddleware,
  RefundController.getRefundsByPaymentIdController
);

/**
 * @route   GET /v1/api/refund/user/:userId
 * @desc    Get user's refund history
 * @access  Private
 */
router.get('/user/:userId', authenticateMiddleware, RefundController.getUserRefundsController);

/**
 * @route   PATCH /v1/api/refund/:refundId/status
 * @desc    Update refund status
 * @access  Private
 */
router.patch(
  '/:refundId/status',
  authenticateMiddleware,
  RefundController.updateRefundStatusController
);

/**
 * @route   GET /v1/api/refund
 * @desc    Get all refunds (Admin)
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticateMiddleware,
  // adminMiddleware, // Add admin middleware if you have it
  RefundController.getAllRefundsController
);

/**
 * @route   DELETE /v1/api/refund/:refundId
 * @desc    Delete refund
 * @access  Private
 */
router.delete('/:refundId', authenticateMiddleware, RefundController.deleteRefundController);

/**
 * @route   GET /v1/api/refund/stats
 * @desc    Get refund statistics
 * @access  Private
 */
router.get('/stats', authenticateMiddleware, RefundController.getRefundStatsController);

export default router;
