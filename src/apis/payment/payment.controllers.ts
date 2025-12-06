import { Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import PaymentService from './payment.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import { PaymentState } from './payment.models';
import {
  CreatePaymentDto,
  UpdatePaymentStateDto,
  GetUserPaymentsQueryDto,
  GetAllPaymentsQueryDto,
  ExpirePendingPaymentsQueryDto,
} from './payment.validators';

/**
 * Helper: Validate DTO
 */
async function validateDto(dtoClass: any, data: any, res: Response): Promise<any | null> {
  const dtoInstance = plainToClass(dtoClass, data);
  const errors = await validate(dtoInstance);

  if (errors.length > 0) {
    const errorMessages = errors
      .map(error => Object.values(error.constraints || {}).join(', '))
      .join('; ');
    badRequestResponse(res, { errors }, errorMessages);
    return null;
  }

  return dtoInstance;
}

/**
 * Create a new payment
 */
export const createPaymentController = async (req: any, res: Response) => {
  try {
    const dto = await validateDto(CreatePaymentDto, req.body, res);
    if (!dto) return;

    const payment = await PaymentService.createPayment(dto);

    return successResponse(res, { payment }, 'Payment created successfully');
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return errorResponse(res, error, error.message || 'Internal server error');
  }
};

/**
 * Get payment by ID (gateway payment ID)
 */
export const getPaymentByIdController = async (req: any, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentService.getPaymentById(paymentId);

    if (!payment) {
      return badRequestResponse(res, null, 'Payment not found');
    }

    return successResponse(res, { payment }, 'Payment retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get user's payment history
 */
export const getUserPaymentsController = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const dto = await validateDto(GetUserPaymentsQueryDto, req.query, res);
    if (!dto) return;

    const payments = await PaymentService.getUserPayments(userId, {
      state: dto.state,
      planType: dto.planType,
      limit: dto.limit,
    });

    return successResponse(
      res,
      { payments, count: payments.length },
      'User payments retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching user payments:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Update payment state
 */
export const updatePaymentStateController = async (req: any, res: Response) => {
  try {
    const { paymentId } = req.params;
    const dto = await validateDto(UpdatePaymentStateDto, req.body, res);
    if (!dto) return;

    const payment = await PaymentService.updatePaymentState(paymentId, dto.state, dto.reason);

    if (!payment) {
      return badRequestResponse(res, null, 'Payment not found');
    }

    return successResponse(res, { payment }, 'Payment state updated successfully');
  } catch (error: any) {
    console.error('Error updating payment state:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get all payments (Admin)
 */
export const getAllPaymentsController = async (req: any, res: Response) => {
  try {
    const dto = await validateDto(GetAllPaymentsQueryDto, req.query, res);
    if (!dto) return;

    const { payments, total } = await PaymentService.getAllPayments({
      state: dto.state,
      planType: dto.planType,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      limit: dto.limit,
      skip: dto.skip,
    });

    return successResponse(
      res,
      { payments, total, count: payments.length },
      'Payments retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching all payments:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Delete payment (GDPR - Right to be forgotten)
 */
export const deletePaymentController = async (req: any, res: Response) => {
  try {
    const { paymentId } = req.params;

    const deleted = await PaymentService.deletePayment(paymentId);

    if (!deleted) {
      return badRequestResponse(res, null, 'Payment not found');
    }

    return successResponse(res, { paymentId }, 'Payment deleted successfully');
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get payment statistics
 */
export const getPaymentStatsController = async (req: any, res: Response) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const stats = await PaymentService.getPaymentStats({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      userId: userId as string,
    });

    return successResponse(res, { stats }, 'Payment statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching payment stats:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Expire pending payments (typically called by cron job)
 */
export const expirePendingPaymentsController = async (req: any, res: Response) => {
  try {
    const dto = await validateDto(ExpirePendingPaymentsQueryDto, req.query, res);
    if (!dto) return;

    const minutes = dto.expiryMinutes || 30;
    const expiredCount = await PaymentService.expirePendingPayments(minutes);

    return successResponse(
      res,
      { expiredCount, expiryMinutes: minutes },
      'Pending payments expired successfully'
    );
  } catch (error: any) {
    console.error('Error expiring pending payments:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};
