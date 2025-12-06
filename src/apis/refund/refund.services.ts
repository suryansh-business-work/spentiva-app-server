import RefundModel, { IRefund, RefundStatus } from './refund.models';
import PaymentModel, { PaymentState } from '../payment/payment.models';
import { logger } from '../../utils/logger';

/**
 * Refund Service
 */
class RefundService {
  /**
   * Create a new refund
   */
  async createRefund(refundData: Partial<IRefund>): Promise<IRefund> {
    try {
      // Verify payment exists and is eligible for refund
      const payment = await PaymentModel.findOne({ paymentId: refundData.paymentId });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.paymentState !== PaymentState.SUCCESS) {
        throw new Error('Only successful payments can be refunded');
      }

      // Check if refund already exists
      const existingRefund = await RefundModel.findOne({
        paymentId: refundData.paymentId,
        refundStatus: {
          $in: [RefundStatus.INITIATED, RefundStatus.PROCESSING, RefundStatus.SUCCESS],
        },
      });

      if (existingRefund) {
        throw new Error('Refund already exists for this payment');
      }

      const refund = await RefundModel.create({
        ...refundData,
        userId: payment.userId,
      });

      logger.info('Refund created', { refundId: refund.refundId, paymentId: refund.paymentId });
      return refund;
    } catch (error: any) {
      logger.error('Error creating refund', { error: error.message });
      throw error;
    }
  }

  /**
   * Get refund by ID
   */
  async getRefundById(refundId: string): Promise<IRefund | null> {
    try {
      const refund = await RefundModel.findOne({ refundId }).populate('userId', 'name email');
      return refund;
    } catch (error) {
      logger.error('Error fetching refund', { error, refundId });
      throw new Error('Failed to fetch refund');
    }
  }

  /**
   * Get refunds by payment ID
   */
  async getRefundsByPaymentId(paymentId: string): Promise<IRefund[]> {
    try {
      const refunds = await RefundModel.find({ paymentId }).sort({ createdAt: -1 });
      return refunds;
    } catch (error) {
      logger.error('Error fetching refunds for payment', { error, paymentId });
      throw new Error('Failed to fetch refunds');
    }
  }

  /**
   * Get all refunds for a user
   */
  async getUserRefunds(
    userId: string,
    filters?: {
      status?: RefundStatus;
      limit?: number;
    }
  ): Promise<IRefund[]> {
    try {
      const query: any = { userId };

      if (filters?.status) {
        query.refundStatus = filters.status;
      }

      const refunds = await RefundModel.find(query)
        .sort({ createdAt: -1 })
        .limit(filters?.limit || 50);

      return refunds;
    } catch (error) {
      logger.error('Error fetching user refunds', { error, userId });
      throw new Error('Failed to fetch user refunds');
    }
  }

  /**
   * Update refund status
   */
  async updateRefundStatus(
    refundId: string,
    status: RefundStatus,
    refundDate?: Date
  ): Promise<IRefund | null> {
    try {
      const updateData: any = {
        refundStatus: status,
      };

      if (status === RefundStatus.SUCCESS && refundDate) {
        updateData.refundDate = refundDate;
      }

      const refund = await RefundModel.findOneAndUpdate({ refundId }, updateData, { new: true });

      if (refund) {
        logger.info('Refund status updated', { refundId, status });
      }

      return refund;
    } catch (error) {
      logger.error('Error updating refund status', { error, refundId });
      throw new Error('Failed to update refund status');
    }
  }

  /**
   * Update refund
   */
  async updateRefund(refundId: string, updateData: Partial<IRefund>): Promise<IRefund | null> {
    try {
      const refund = await RefundModel.findOneAndUpdate({ refundId }, updateData, { new: true });

      if (refund) {
        logger.info('Refund updated', { refundId });
      }

      return refund;
    } catch (error) {
      logger.error('Error updating refund', { error, refundId });
      throw new Error('Failed to update refund');
    }
  }

  /**
   * Delete refund
   */
  async deleteRefund(refundId: string): Promise<boolean> {
    try {
      const result = await RefundModel.deleteOne({ refundId });
      logger.info('Refund deleted', { refundId, deleted: result.deletedCount });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Error deleting refund', { error, refundId });
      throw new Error('Failed to delete refund');
    }
  }

  /**
   * Get all refunds (Admin)
   */
  async getAllRefunds(filters?: {
    status?: RefundStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  }): Promise<{ refunds: IRefund[]; total: number }> {
    try {
      const query: any = {};

      if (filters?.status) {
        query.refundStatus = filters.status;
      }

      if (filters?.startDate || filters?.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.createdAt.$lte = filters.endDate;
        }
      }

      const total = await RefundModel.countDocuments(query);
      const refunds = await RefundModel.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(filters?.limit || 50)
        .skip(filters?.skip || 0);

      return { refunds, total };
    } catch (error) {
      logger.error('Error fetching all refunds', { error });
      throw new Error('Failed to fetch refunds');
    }
  }

  /**
   * Get refund statistics
   */
  async getRefundStats(filters?: { startDate?: Date; endDate?: Date }): Promise<any> {
    try {
      const matchQuery: any = {};

      if (filters?.startDate || filters?.endDate) {
        matchQuery.createdAt = {};
        if (filters.startDate) {
          matchQuery.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          matchQuery.createdAt.$lte = filters.endDate;
        }
      }

      const stats = await RefundModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalRefunds: { $sum: 1 },
            totalRefundAmount: { $sum: '$refundAmount' },
            successRefunds: {
              $sum: { $cond: [{ $eq: ['$refundStatus', RefundStatus.SUCCESS] }, 1, 0] },
            },
            failedRefunds: {
              $sum: { $cond: [{ $eq: ['$refundStatus', RefundStatus.FAILED] }, 1, 0] },
            },
            pendingRefunds: {
              $sum: {
                $cond: [
                  { $in: ['$refundStatus', [RefundStatus.INITIATED, RefundStatus.PROCESSING]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      return (
        stats[0] || {
          totalRefunds: 0,
          totalRefundAmount: 0,
          successRefunds: 0,
          failedRefunds: 0,
          pendingRefunds: 0,
        }
      );
    } catch (error) {
      logger.error('Error fetching refund stats', { error });
      throw new Error('Failed to fetch refund statistics');
    }
  }
}

export default new RefundService();
