import express from 'express';
import {
  parseExpenseController,
  createExpenseController,
  getAllExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  deleteExpenseController,
  chatController,
} from './expense.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * Expense Routes
 */

// POST /api/expenses/parse - Parse expense from natural language
router.post('/parse', authenticateMiddleware, parseExpenseController);

// POST /api/expenses/chat - Chat with AI for expense tracking
router.post('/chat', authenticateMiddleware, chatController);

// POST /api/expenses - Create a new expense
router.post('/', createExpenseController);

// GET /api/expenses - Get all expenses with optional filtering
router.get('/', getAllExpensesController);

// GET /api/expenses/:id - Get a specific expense
router.get('/:id', getExpenseByIdController);

// PUT /api/expenses/:id - Update an expense
router.put('/:id', updateExpenseController);

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', deleteExpenseController);

export default router;
