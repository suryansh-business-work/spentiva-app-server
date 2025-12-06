import express from 'express';
import * as PaymentController from './payment.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * @route   POST /v1/api/payment
 * @desc    Create a new payment
 * @access  Private
 */
router.post('/', authenticateMiddleware, PaymentController.createPaymentController);

/**
 * @route   GET /v1/api/payment/:paymentId
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/:paymentId', authenticateMiddleware, PaymentController.getPaymentByIdController);

/**
 * @route   GET /v1/api/payment/user/:userId
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/user/:userId', authenticateMiddleware, PaymentController.getUserPaymentsController);

/**
 * @route   PATCH /v1/api/payment/:paymentId/state
 * @desc    Update payment state
 * @access  Private
 */
router.patch(
  '/:paymentId/state',
  authenticateMiddleware,
  PaymentController.updatePaymentStateController
);

/**
 * @route   GET /v1/api/payment
 * @desc    Get all payments (Admin)
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticateMiddleware,
  // adminMiddleware, // Add admin middleware if you have it
  PaymentController.getAllPaymentsController
);

/**
 * @route   DELETE /v1/api/payment/:paymentId
 * @desc    Delete payment (GDPR)
 * @access  Private
 */
router.delete('/:paymentId', authenticateMiddleware, PaymentController.deletePaymentController);

/**
 * @route   GET /v1/api/payment/stats
 * @desc    Get payment statistics
 * @access  Private
 */
router.get('/stats', authenticateMiddleware, PaymentController.getPaymentStatsController);

/**
 * @route   POST /v1/api/payment/expire-pending
 * @desc    Expire pending payments (Cron job endpoint)
 * @access  Private (Admin/System)
 */
router.post(
  '/expire-pending',
  authenticateMiddleware,
  // adminMiddleware, // Add admin middleware
  PaymentController.expirePendingPaymentsController
);

export default router;
