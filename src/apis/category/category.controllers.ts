import { Response } from 'express';
import CategoryService from './category.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../config/categories';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  GetAllCategoriesQueryDto,
  CategoryResponseDto,
} from './category.validators';

/**
 * Category Controllers - Request handlers using response-object.ts
 */

/**
 * Get categories and payment methods (from config)
 */
export const getCategoriesController = async (req: any, res: Response) => {
  try {
    return successResponse(
      res,
      {
        categories: EXPENSE_CATEGORIES,
        paymentMethods: PAYMENT_METHODS,
      },
      'Categories retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get all custom categories from database
 */
export const getAllCategoriesController = async (req: any, res: Response) => {
  try {
    const queryDto: GetAllCategoriesQueryDto = req.query;
    const categories = await CategoryService.getAllCategories(queryDto.trackerId);

    return successResponse(res, { categories }, 'Custom categories retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching custom categories:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Create a new category
 */
export const createCategoryController = async (req: any, res: Response) => {
  try {
    const createDto: CreateCategoryDto = req.body;

    if (!createDto.trackerId || !createDto.name) {
      return badRequestResponse(res, null, 'Missing required fields: trackerId, name');
    }

    const category = await CategoryService.createCategory(
      createDto.trackerId,
      createDto.name,
      createDto.subcategories || []
    );

    const responseDto = new CategoryResponseDto(category);

    return successResponse(res, { category: responseDto }, 'Category created successfully');
  } catch (error: any) {
    console.error('Error creating category:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryByIdController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const category = await CategoryService.getCategoryById(id);

    return successResponse(res, { category }, 'Category retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching category:', error);
    if (error.message === 'Category not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Update a category
 */
export const updateCategoryController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateDto: UpdateCategoryDto = req.body;

    const category = await CategoryService.updateCategory(id, updateDto);

    const responseDto = new CategoryResponseDto(category);

    return successResponse(res, { category: responseDto }, 'Category updated successfully');
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.message === 'Category not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Delete a category
 */
export const deleteCategoryController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id);

    return successResponse(res, result, result.message);
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.message === 'Category not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};
