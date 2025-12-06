import PaymentModel, {
  IPayment,
  PaymentState,
  PaymentMethod,
  UserSelectedPlan,
  PlanDuration,
  PaymentType,
  Currency,
} from './payment.models';
import { logger } from '../../utils/logger';

/**
 * Payment Service
 */
class PaymentService {
  /**
   * Create a new payment log
   */
  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    try {
      const payment = await PaymentModel.create(paymentData);
      logger.info('Payment created', { paymentId: payment.paymentId });
      return payment;
    } catch (error) {
      logger.error('Error creating payment', { error });
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<IPayment | null> {
    try {
      const payment = await PaymentModel.findOne({ paymentId }).populate('userId', 'name email');
      return payment;
    } catch (error) {
      logger.error('Error fetching payment', { error, paymentId });
      throw new Error('Failed to fetch payment');
    }
  }

  /**
   * Get payment by MongoDB _id
   */
  async getPaymentByMongoId(id: string): Promise<IPayment | null> {
    try {
      const payment = await PaymentModel.findById(id).populate('userId', 'name email');
      return payment;
    } catch (error) {
      logger.error('Error fetching payment by ID', { error, id });
      throw new Error('Failed to fetch payment');
    }
  }

  /**
   * Get all payments for a user
   */
  async getUserPayments(
    userId: string,
    filters?: {
      state?: PaymentState;
      planType?: UserSelectedPlan;
      limit?: number;
    }
  ): Promise<IPayment[]> {
    try {
      const query: any = { userId };

      if (filters?.state) {
        query.paymentState = filters.state;
      }

      if (filters?.planType) {
        query.userSelectedPlan = filters.planType;
      }

      const payments = await PaymentModel.find(query)
        .sort({ createdAt: -1 })
        .limit(filters?.limit || 50);

      return payments;
    } catch (error) {
      logger.error('Error fetching user payments', { error, userId });
      throw new Error('Failed to fetch user payments');
    }
  }

  /**
   * Update payment state
   */
  async updatePaymentState(
    paymentId: string,
    state: PaymentState,
    reason: string
  ): Promise<IPayment | null> {
    try {
      const payment = await PaymentModel.findOneAndUpdate(
        { paymentId },
        {
          paymentState: state,
          paymentStateReason: reason,
          ...(state === PaymentState.SUCCESS && { paymentDate: new Date() }),
        },
        { new: true }
      );

      if (payment) {
        logger.info('Payment state updated', { paymentId, state, reason });
      }

      return payment;
    } catch (error) {
      logger.error('Error updating payment state', { error, paymentId });
      throw new Error('Failed to update payment state');
    }
  }

  /**
   * Update payment
   */
  async updatePayment(paymentId: string, updateData: Partial<IPayment>): Promise<IPayment | null> {
    try {
      const payment = await PaymentModel.findOneAndUpdate({ paymentId }, updateData, {
        new: true,
      });

      if (payment) {
        logger.info('Payment updated', { paymentId });
      }

      return payment;
    } catch (error) {
      logger.error('Error updating payment', { error, paymentId });
      throw new Error('Failed to update payment');
    }
  }

  /**
   * Delete payment (GDPR - Right to be forgotten)
   */
  async deletePayment(paymentId: string): Promise<boolean> {
    try {
      const result = await PaymentModel.deleteOne({ paymentId });
      logger.info('Payment deleted', { paymentId, deleted: result.deletedCount });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Error deleting payment', { error, paymentId });
      throw new Error('Failed to delete payment');
    }
  }

  /**
   * Get all payments (Admin)
   */
  async getAllPayments(filters?: {
    state?: PaymentState;
    planType?: UserSelectedPlan;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  }): Promise<{ payments: IPayment[]; total: number }> {
    try {
      const query: any = {};

      if (filters?.state) {
        query.paymentState = filters.state;
      }

      if (filters?.planType) {
        query.userSelectedPlan = filters.planType;
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

      const total = await PaymentModel.countDocuments(query);
      const payments = await PaymentModel.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(filters?.limit || 50)
        .skip(filters?.skip || 0);

      return { payments, total };
    } catch (error) {
      logger.error('Error fetching all payments', { error });
      throw new Error('Failed to fetch payments');
    }
  }

  /**
   * Expire old pending payments (payments not completed in X time)
   * Should be run via cron job
   */
  async expirePendingPayments(expiryMinutes: number = 30): Promise<number> {
    try {
      const expiryTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

      const result = await PaymentModel.updateMany(
        {
          paymentState: { $in: [PaymentState.INITIATED, PaymentState.PROCESSING] },
          createdAt: { $lt: expiryTime },
        },
        {
          paymentState: PaymentState.EXPIRED,
          paymentStateReason: `Payment expired after ${expiryMinutes} minutes`,
        }
      );

      logger.info('Expired pending payments', {
        count: result.modifiedCount,
        expiryMinutes,
      });

      return result.modifiedCount;
    } catch (error) {
      logger.error('Error expiring pending payments', { error });
      throw new Error('Failed to expire pending payments');
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }): Promise<any> {
    try {
      const matchQuery: any = {};

      if (filters?.userId) {
        matchQuery.userId = filters.userId;
      }

      if (filters?.startDate || filters?.endDate) {
        matchQuery.createdAt = {};
        if (filters.startDate) {
          matchQuery.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          matchQuery.createdAt.$lte = filters.endDate;
        }
      }

      const stats = await PaymentModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            successPayments: {
              $sum: { $cond: [{ $eq: ['$paymentState', PaymentState.SUCCESS] }, 1, 0] },
            },
            failedPayments: {
              $sum: { $cond: [{ $eq: ['$paymentState', PaymentState.FAILED] }, 1, 0] },
            },
            pendingPayments: {
              $sum: {
                $cond: [
                  {
                    $in: ['$paymentState', [PaymentState.INITIATED, PaymentState.PROCESSING]],
                  },
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
          totalPayments: 0,
          totalAmount: 0,
          successPayments: 0,
          failedPayments: 0,
          pendingPayments: 0,
        }
      );
    } catch (error) {
      logger.error('Error fetching payment stats', { error });
      throw new Error('Failed to fetch payment statistics');
    }
  }
}

export default new PaymentService();
