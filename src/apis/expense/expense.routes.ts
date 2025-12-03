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

// POST /api/expense/parse - Parse expense from natural language
router.post('/parse', authenticateMiddleware, parseExpenseController);

// POST /api/expense/chat - Chat with AI for expense tracking
router.post('/chat', authenticateMiddleware, chatController);

// POST /api/expense - Create a new expense
router.post('/create', createExpenseController);

// GET /api/expense - Get all expenses with optional filtering
router.get('/all', getAllExpensesController);

// GET /api/expenses/:id - Get a specific expense
router.get('/:id', getExpenseByIdController);

// PUT /api/expenses/:id - Update an expense
router.put('/:id', updateExpenseController);

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', deleteExpenseController);

export default router;
