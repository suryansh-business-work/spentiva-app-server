import { Response } from 'express';
import ExpenseService from './expense.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import TrackerModel from '../tracker/tracker.models';

/**
 * Expense Controllers - Request handlers using response-object.ts
 */

/**
 * Parse expense from natural language message
 */
export const parseExpenseController = async (req: any, res: Response) => {
  try {
    const { message, trackerId } = req.body;

    console.log('[Parse Expense] Request received:', {
      hasMessage: !!message,
      hasTrackerId: !!trackerId,
      hasUserId: !!req.user?.userId,
      trackerId,
      userId: req.user?.userId,
    });

    if (!message) {
      return badRequestResponse(res, null, 'Message is required');
    }

    if (!trackerId) {
      return badRequestResponse(res, null, 'Tracker ID is required');
    }

    // Get tracker information for snapshot
    let trackerSnapshot = null;
    if (req.user?.userId && trackerId) {
      try {
        const tracker = await TrackerModel.findOne({
          _id: trackerId,
          userId: req.user.userId,
        });

        if (tracker) {
          const { createTrackerSnapshot } = await import('../usage-log/usage-log.services');
          trackerSnapshot = createTrackerSnapshot(tracker);
        } else {
          return badRequestResponse(res, null, 'Tracker not found');
        }
      } catch (err) {
        console.error('[Parse Expense] Error fetching tracker:', err);
        return errorResponse(res, err, 'Error fetching tracker information');
      }
    }

    // Log user message with tracker snapshot
    if (trackerSnapshot) {
      try {
        const { encode } = await import('gpt-tokenizer');
        const userTokens = encode(message).length;

        const { logUsage } = await import('../usage-log/usage-log.services');
        await logUsage(req.user.userId, trackerSnapshot, 'user', message, userTokens);
        console.log('[Parse Expense] User message logged with snapshot');
      } catch (logError) {
        console.error('[Parse Expense] Error logging user message:', logError);
        // Continue processing even if logging fails
      }
    }

    const parsed = await ExpenseService.parseExpense(message);

    // Log AI response with tracker snapshot
    if (trackerSnapshot && !('error' in parsed)) {
      try {
        const responseText = `Parsed expense: ₹${parsed.amount} for ${parsed.subcategory} via ${parsed.paymentMethod}`;
        const { encode } = await import('gpt-tokenizer');
        const aiTokens = encode(responseText).length;

        const { logUsage } = await import('../usage-log/usage-log.services');
        await logUsage(req.user.userId, trackerSnapshot, 'assistant', responseText, aiTokens);
        console.log('[Parse Expense] AI response logged with snapshot');
      } catch (logError) {
        console.error('[Parse Expense] Error logging AI response:', logError);
        // Continue processing even if logging fails
      }
    }

    if ('error' in parsed) {
      return badRequestResponse(res, parsed, 'Failed to parse expense');
    }

    return successResponse(res, parsed, 'Expense parsed successfully');
  } catch (error: any) {
    console.error('Error parsing expense:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Create a new expense
 */
export const createExpenseController = async (req: any, res: Response) => {
  try {
    const {
      amount,
      category,
      subcategory,
      categoryId,
      paymentMethod,
      description,
      timestamp,
      trackerId,
    } = req.body;
    const userId = req.user?.userId;

    const expense = await ExpenseService.createExpense({
      amount,
      category,
      subcategory,
      categoryId,
      paymentMethod,
      description,
      timestamp,
      trackerId,
      userId,
    });

    return successResponse(
      res,
      {
        expense: {
          id: expense._id.toString(),
          amount: expense.amount,
          category: expense.category,
          subcategory: expense.subcategory,
          categoryId: expense.categoryId,
          paymentMethod: expense.paymentMethod,
          description: expense.description,
          timestamp: expense.timestamp,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt,
        },
      },
      'Expense logged successfully'
    );
  } catch (error: any) {
    console.error('Error creating expense:', error);
    if (error.message.includes('Missing required fields')) {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get all expenses with optional filtering
 */
export const getAllExpensesController = async (req: any, res: Response) => {
  try {
    const { trackerId, limit } = req.query;
    const userId = req.user?.userId;

    const expenses = await ExpenseService.getAllExpenses({
      trackerId: trackerId as string,
      userId,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    const formattedExpenses = expenses.map(expense => ({
      id: expense._id.toString(),
      amount: expense.amount,
      category: expense.category,
      subcategory: expense.subcategory,
      categoryId: expense.categoryId,
      paymentMethod: expense.paymentMethod,
      description: expense.description,
      timestamp: expense.timestamp,
      trackerId: expense.trackerId || 'default',
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    }));

    return successResponse(res, { expenses: formattedExpenses }, 'Expenses retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get a single expense by ID
 */
export const getExpenseByIdController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const expense = await ExpenseService.getExpenseById(id, userId);

    const formattedExpense = {
      id: expense._id.toString(),
      amount: expense.amount,
      category: expense.category,
      subcategory: expense.subcategory,
      categoryId: expense.categoryId,
      paymentMethod: expense.paymentMethod,
      description: expense.description,
      timestamp: expense.timestamp,
      trackerId: expense.trackerId,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };

    return successResponse(res, { expense: formattedExpense }, 'Expense retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching expense:', error);
    if (error.message === 'Expense not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Update an expense
 */
export const updateExpenseController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category, subcategory, categoryId, paymentMethod, description, timestamp } =
      req.body;
    const userId = req.user?.userId;

    const expense = await ExpenseService.updateExpense(
      id,
      { amount, category, subcategory, categoryId, paymentMethod, description, timestamp },
      userId
    );

    const formattedExpense = {
      id: expense._id.toString(),
      amount: expense.amount,
      category: expense.category,
      subcategory: expense.subcategory,
      categoryId: expense.categoryId,
      paymentMethod: expense.paymentMethod,
      description: expense.description,
      timestamp: expense.timestamp,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };

    return successResponse(res, { expense: formattedExpense }, 'Expense updated successfully');
  } catch (error: any) {
    console.error('Error updating expense:', error);
    if (error.message === 'Expense not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Delete an expense
 */
export const deleteExpenseController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await ExpenseService.deleteExpense(id, userId);

    return successResponse(res, { id }, result.message);
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    if (error.message === 'Expense not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Chat endpoint for conversational expense tracking
 */
export const chatController = async (req: any, res: Response) => {
  try {
    const { message, history = [], trackerId } = req.body;

    if (!message) {
      return badRequestResponse(res, null, 'Message is required');
    }

    // Get tracker snapshot and log user message
    let trackerSnapshot = null;
    if (req.user?.userId && trackerId) {
      try {
        const tracker = await TrackerModel.findOne({
          _id: trackerId,
          userId: req.user.userId,
        });

        if (tracker) {
          const { createTrackerSnapshot, logUsage } =
            await import('../usage-log/usage-log.services');
          const { encode } = await import('gpt-tokenizer');

          trackerSnapshot = createTrackerSnapshot(tracker);
          const userTokens = encode(message).length;

          await logUsage(req.user.userId, trackerSnapshot, 'user', message, userTokens);
        }
      } catch (err) {
        console.error('[Chat] Error logging user message:', err);
      }
    }

    const { ExpenseParser } = await import('../../services/expenseParser');
    const response = await ExpenseParser.getChatResponse(message, history);

    // Log AI response
    if (trackerSnapshot && response) {
      try {
        const { logUsage } = await import('../usage-log/usage-log.services');
        const { encode } = await import('gpt-tokenizer');

        const aiTokens = encode(response).length;

        await logUsage(req.user.userId, trackerSnapshot, 'assistant', response, aiTokens);
      } catch (err) {
        console.error('[Chat] Error logging AI response:', err);
      }
    }

    return successResponse(res, { response }, 'Chat response generated');
  } catch (error: any) {
    console.error('Error in chat:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};
