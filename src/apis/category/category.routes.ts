import express from 'express';
import {
  getCategoriesController,
  getAllCategoriesController,
  createCategoryController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from './category.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * Category Routes
 */

// GET /api/categories - Get predefined categories and payment methods
router.get('/', getCategoriesController);

// GET /api/categories/custom - Get custom categories from database
router.get('/all', authenticateMiddleware, getAllCategoriesController);

// POST /api/categories - Create a new custom category
router.post('/create', authenticateMiddleware, createCategoryController);

// GET /api/categories/:id - Get a specific category
router.get('/:id', authenticateMiddleware, getCategoryByIdController);

// PUT /api/categories/:id - Update a category
router.put('/:id', authenticateMiddleware, updateCategoryController);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', authenticateMiddleware, deleteCategoryController);

export default router;
