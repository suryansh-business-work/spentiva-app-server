import { Response } from 'express';
import CategoryService from './category.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../config/categories';

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
    const { trackerId } = req.query;
    const categories = await CategoryService.getAllCategories(trackerId as string);

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
    const { trackerId, name, subcategories } = req.body;

    if (!trackerId || !name) {
      return badRequestResponse(res, null, 'Missing required fields: trackerId, name');
    }

    const category = await CategoryService.createCategory(trackerId, name, subcategories || []);

    res.status(201).json({
      message: 'Category created successfully',
      data: { category },
      status: 'success',
      statusCode: 201
    });
    return;
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
    const { name, subcategories } = req.body;

    const category = await CategoryService.updateCategory(id, { name, subcategories });

    return successResponse(res, { category }, 'Category updated successfully');
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
