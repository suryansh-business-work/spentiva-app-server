import { Request, Response } from 'express';
import { AdminService } from './admin.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetUsersStatsDto, GetAllUsersDto, UpdateUserDto } from './admin.validators';

/**
 * Admin Controllers
 */
export class AdminController {
  /**
   * Get user statistics
   * GET /v1/api/admin/stats
   */
  static async getUsersStatistics(req: Request, res: Response) {
    try {
      const dto = plainToClass(GetUsersStatsDto, req.query);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return badRequestResponse(res, errors, 'Validation failed');
      }

      const { filter, startDate, endDate } = dto;
      const stats = await AdminService.getUsersStatistics(filter, startDate, endDate);

      return successResponse(res, stats, 'Statistics retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error, error.message || 'Failed to get statistics');
    }
  }

  /**
   * Get all users with pagination
   * GET /v1/api/admin/users
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const dto = plainToClass(GetAllUsersDto, {
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        emailVerified:
          req.query.emailVerified === 'true'
            ? true
            : req.query.emailVerified === 'false'
              ? false
              : undefined,
      });

      const errors = await validate(dto);
      if (errors.length > 0) {
        return badRequestResponse(res, errors, 'Validation failed');
      }

      const result = await AdminService.getAllUsers(dto.page, dto.limit, {
        role: dto.role,
        accountType: dto.accountType,
        emailVerified: dto.emailVerified,
      });

      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error, error.message || 'Failed to get users');
    }
  }

  /**
   * Get user by ID
   * GET /v1/api/admin/users/:userId
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const result = await AdminService.getUserById(userId);

      return successResponse(res, result, 'User retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error, error.message || 'Failed to get user');
    }
  }

  /**
   * Update user
   * PUT /v1/api/admin/users/:userId
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const dto = plainToClass(UpdateUserDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return badRequestResponse(res, errors, 'Validation failed');
      }

      const result = await AdminService.updateUser(userId, dto);

      return successResponse(res, result, 'User updated successfully');
    } catch (error: any) {
      return badRequestResponse(res, error, error.message || 'Failed to update user');
    }
  }

  /**
   * Delete user
   * DELETE /v1/api/admin/users/:userId
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const result = await AdminService.deleteUser(userId);

      return successResponse(res, result, 'User deleted successfully');
    } catch (error: any) {
      return badRequestResponse(res, error, error.message || 'Failed to delete user');
    }
  }
}

export default AdminController;
