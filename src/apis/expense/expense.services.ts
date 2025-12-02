import ExpenseModel from './expense.models';
import { ExpenseParser } from '../../services/expenseParser';

/**
 * Expense Service - Business logic for expenses
 */
export class ExpenseService {
  /**
   * Parse expense from natural language
   */
  static async parseExpense(message: string) {
    const parsed = await ExpenseParser.parseExpense(message);
    return parsed;
  }

  /**
   * Get all expenses with optional filtering
   */
  static async getAllExpenses(filters: { trackerId?: string; userId?: string; limit?: number }) {
    const { trackerId, userId, limit = 100 } = filters;
    const query: any = {};

    if (trackerId) query.trackerId = trackerId;
    if (userId) query.userId = userId;

    const expenses = await ExpenseModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return expenses;
  }

  /**
   * Get a specific expense by ID
   */
  static async getExpenseById(expenseId: string, userId?: string) {
    const query: any = { _id: expenseId };
    if (userId) query.userId = userId;

    const expense = await ExpenseModel.findOne(query);
    if (!expense) {
      throw new Error('Expense not found');
    }
    return expense;
  }

  /**
   * Create a new expense
   */
  static async createExpense(data: {
    amount: number;
    category: string;
    subcategory: string;
    categoryId: string;
    paymentMethod: string;
    description?: string;
    timestamp?: Date;
    trackerId?: string;
    userId?: string;
  }) {
    const { amount, category, subcategory, categoryId, paymentMethod, description, timestamp, trackerId, userId } = data;

    if (!amount || !category || !subcategory || !categoryId || !paymentMethod) {
      throw new Error('Missing required fields: amount, category, subcategory, categoryId, paymentMethod');
    }

    const expense = await ExpenseModel.create({
      amount,
      category,
      subcategory,
      categoryId,
      paymentMethod,
      description,
      timestamp: timestamp || new Date(),
      trackerId: trackerId || 'default',
      userId
    });

    return expense;
  }

  /**
   * Update an expense
   */
  static async updateExpense(
    expenseId: string,
    updates: {
      amount?: number;
      category?: string;
      subcategory?: string;
      categoryId?: string;
      paymentMethod?: string;
      description?: string;
      timestamp?: Date;
    },
    userId?: string
  ) {
    const query: any = { _id: expenseId };
    if (userId) query.userId = userId;

    const expense = await ExpenseModel.findOneAndUpdate(
      query,
      updates,
      { new: true, runValidators: true }
    );

    if (!expense) {
      throw new Error('Expense not found');
    }

    return expense;
  }

  /**
   * Delete an expense
   */
  static async deleteExpense(expenseId: string, userId?: string) {
    const query: any = { _id: expenseId };
    if (userId) query.userId = userId;

    const expense = await ExpenseModel.findOneAndDelete(query);

    if (!expense) {
      throw new Error('Expense not found');
    }

    return { message: 'Expense deleted successfully' };
  }
}

export default ExpenseService;
