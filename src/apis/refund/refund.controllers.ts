import { Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import RefundService from './refund.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import {
  CreateRefundDto,
  UpdateRefundStatusDto,
  GetUserRefundsQueryDto,
  GetAllRefundsQueryDto,
} from './refund.validators';

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
 * Create a new refund
 */
export const createRefundController = async (req: any, res: Response) => {
  try {
    const dto = await validateDto(CreateRefundDto, req.body, res);
    if (!dto) return;

    const refund = await RefundService.createRefund(dto);

    return successResponse(res, { refund }, 'Refund created successfully');
  } catch (error: any) {
    console.error('Error creating refund:', error);
    return errorResponse(res, error, error.message || 'Internal server error');
  }
};

/**
 * Get refund by ID
 */
export const getRefundByIdController = async (req: any, res: Response) => {
  try {
    const { refundId } = req.params;

    const refund = await RefundService.getRefundById(refundId);

    if (!refund) {
      return badRequestResponse(res, null, 'Refund not found');
    }

    return successResponse(res, { refund }, 'Refund retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching refund:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get refunds by payment ID
 */
export const getRefundsByPaymentIdController = async (req: any, res: Response) => {
  try {
    const { paymentId } = req.params;

    const refunds = await RefundService.getRefundsByPaymentId(paymentId);

    return successResponse(
      res,
      { refunds, count: refunds.length },
      'Refunds retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching refunds:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get user's refund history
 */
export const getUserRefundsController = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const dto = await validateDto(GetUserRefundsQueryDto, req.query, res);
    if (!dto) return;

    const refunds = await RefundService.getUserRefunds(userId, {
      status: dto.status,
      limit: dto.limit,
    });

    return successResponse(
      res,
      { refunds, count: refunds.length },
      'User refunds retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching user refunds:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Update refund status
 */
export const updateRefundStatusController = async (req: any, res: Response) => {
  try {
    const { refundId } = req.params;
    const dto = await validateDto(UpdateRefundStatusDto, req.body, res);
    if (!dto) return;

    const refund = await RefundService.updateRefundStatus(
      refundId,
      dto.status,
      dto.refundDate ? new Date(dto.refundDate) : undefined
    );

    if (!refund) {
      return badRequestResponse(res, null, 'Refund not found');
    }

    return successResponse(res, { refund }, 'Refund status updated successfully');
  } catch (error: any) {
    console.error('Error updating refund status:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get all refunds (Admin)
 */
export const getAllRefundsController = async (req: any, res: Response) => {
  try {
    const dto = await validateDto(GetAllRefundsQueryDto, req.query, res);
    if (!dto) return;

    const { refunds, total } = await RefundService.getAllRefunds({
      status: dto.status,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      limit: dto.limit,
      skip: dto.skip,
    });

    return successResponse(
      res,
      { refunds, total, count: refunds.length },
      'Refunds retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching all refunds:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Delete refund
 */
export const deleteRefundController = async (req: any, res: Response) => {
  try {
    const { refundId } = req.params;

    const deleted = await RefundService.deleteRefund(refundId);

    if (!deleted) {
      return badRequestResponse(res, null, 'Refund not found');
    }

    return successResponse(res, { refundId }, 'Refund deleted successfully');
  } catch (error: any) {
    console.error('Error deleting refund:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get refund statistics
 */
export const getRefundStatsController = async (req: any, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await RefundService.getRefundStats({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    return successResponse(res, { stats }, 'Refund statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching refund stats:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};
