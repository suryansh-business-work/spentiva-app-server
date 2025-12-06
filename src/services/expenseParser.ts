import OpenAI from 'openai';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../config/categories';
import { ParsedExpense } from '../types';
import config from '../config/env';
import { logger } from '../utils/logger';

const openai = config.OPENAI_API_KEY ? new OpenAI({ apiKey: config.OPENAI_API_KEY }) : null;

export class ExpenseParser {
  private static buildSystemPrompt(categories: any[]): string {
    const categoriesList = categories
      .map(cat => {
        const subcats = cat.subcategories?.map((s: any) => s.name).join(', ') || '';
        return `${cat.name}: ${subcats}`;
      })
      .join('\n');

    return `You are an expense tracking assistant. Parse user messages about expenses and extract structured data.

AVAILABLE CATEGORIES AND SUBCATEGORIES:
${categoriesList}

AVAILABLE PAYMENT METHODS:
${PAYMENT_METHODS.join(', ')}

PARSING RULES:
1. Extract ALL expenses from the message (can be single or multiple)
2. For each expense extract: amount, category, subcategory, paymentMethod (optional), description (optional)
3. ALWAYS return an array of expense objects

CATEGORY MATCHING RULES - VERY IMPORTANT:
- Try to match user's intent to the AVAILABLE CATEGORIES list above
- Use the EXACT category name from the available list
- For example: "food" → "Food & Dining", "transport" → "Transportation", "movie" → "Entertainment"
- If you CANNOT find a matching category in the available list, use the EXACT word/phrase the user mentioned
- Example: User says "xyz" and "xyz" is NOT in available categories → use "xyz" as category
- Example: User says "random stuff" and not in list → use "random stuff" as category
- DO NOT invent or assume categories
- DO NOT use placeholders like "User not provided category" or "Unknown"

PAYMENT METHOD RULES:
- If user mentions a payment method, use it
- If user does NOT mention payment method, use "User not provided payment method"

SUBCATEGORY RULES:
- If category is found in available list, pick the most appropriate subcategory
- If category is NOT found, use the same value as category for subcategory

EXAMPLES:

Input: "spent 50 on lunch"
Output: [{"amount": 50, "category": "Food & Dining", "subcategory": "Foods", "paymentMethod": "User not provided payment method"}]

Input: "spent 50 on xyz, spent 100 on food using cash"
Output: [
  {"amount": 50, "category": "xyz", "subcategory": "xyz", "paymentMethod": "User not provided payment method"},
  {"amount": 100, "category": "Food & Dining", "subcategory": "Foods", "paymentMethod": "Cash"}
]

Input: "bought groceries 200 and paid electricity bill 1500 via UPI"
Output: [
  {"amount": 200, "category": "Food & Dining", "subcategory": "Grocery & Vegetables", "paymentMethod": "User not provided payment method"},
  {"amount": 1500, "category": "Home & Living", "subcategory": "Bills", "paymentMethod": "UPI"}
]

Input: "taxi 150 cash, coffee 80 credit card, and movie tickets 500"
Output: [
  {"amount": 150, "category": "Transportation", "subcategory": "Taxi", "paymentMethod": "Cash"},
  {"amount": 80, "category": "Food & Dining", "subcategory": "Foods", "paymentMethod": "Credit Card"},
  {"amount": 500, "category": "Entertainment", "subcategory": "Movies", "paymentMethod": "User not provided payment method", "description": "movie tickets"}
]

RESPONSE FORMAT (MUST be valid JSON array):
[
  {
    "amount": number,
    "category": "string (EXACT from available list OR EXACT from user input)",
    "subcategory": "string",
    "paymentMethod": "string (default: 'User not provided payment method')",
    "description": "string (optional)"
  }
]

ERROR FORMAT (only if you cannot parse amount):
{
  "error": "Parsing failed",
  "message": "Could not understand the expense. Please provide at least amount and category."
}`;
  }

  static async parseExpense(
    userMessage: string,
    trackerId?: string
  ): Promise<
    | { expenses: ParsedExpense[]; usage: any }
    | { error: string; message?: string; missingCategories?: string[]; usage?: any }
  > {
    if (!openai) {
      return {
        error: 'Configuration error',
        message: 'OpenAI API key not configured. Cannot parse expense.',
      };
    }

    try {
      // Fetch categories dynamically if trackerId is provided
      let categories: any[] = [];
      if (trackerId) {
        const { CategoryService } = await import('../apis/category/category.services');
        categories = await CategoryService.getAllCategories(trackerId);
      } else {
        categories = Object.values(EXPENSE_CATEGORIES);
      }

      if (!categories || categories.length === 0) {
        return {
          error: 'No categories found',
          message: 'No categories found for this tracker. Please add categories first.',
        };
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.buildSystemPrompt(categories) },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 500, // Increased for multiple expenses
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return { error: 'No response from AI' };
      }

      // Get actual token usage from OpenAI
      const usage = completion.usage;
      logger.info('OpenAI expense parsing completed', {
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        total_tokens: usage?.total_tokens,
      });

      const parsed = JSON.parse(response);

      // Check if error response
      if (parsed.error) {
        return { ...parsed, usage };
      }

      // Ensure response is an array
      const expensesArray = Array.isArray(parsed) ? parsed : [parsed];

      // Validate and enrich each expense
      const validatedExpenses: ParsedExpense[] = [];
      const missingCategories: string[] = [];

      for (let i = 0; i < expensesArray.length; i++) {
        const expense = expensesArray[i];

        // Validate required fields including paymentMethod
        if (
          !expense.amount ||
          !expense.category ||
          !expense.subcategory ||
          !expense.paymentMethod
        ) {
          return {
            error: 'Validation error',
            message: `Expense at index ${i}: Missing required fields (amount, category, subcategory, paymentMethod)`,
            usage,
          };
        }

        // Find the category ID from the fetched categories
        const categoryEntry = categories.find(cat => cat.name === expense.category);

        if (!categoryEntry) {
          // Collect missing category
          if (!missingCategories.includes(expense.category)) {
            missingCategories.push(expense.category);
          }
          continue; // Continue to check other expenses
        }

        // Add categoryId and timestamp
        validatedExpenses.push({
          amount: expense.amount,
          category: expense.category,
          subcategory: expense.subcategory,
          categoryId: categoryEntry._id || categoryEntry.id,
          paymentMethod: expense.paymentMethod, // Required - defaults to "User not provided payment method"
          description: expense.description, // Optional
          timestamp: new Date(),
        });
      }

      // If there are missing categories, return structured error
      if (missingCategories.length > 0) {
        return {
          error: 'Category not found',
          message: `Please add these categories first: ${missingCategories.join(', ')}`,
          missingCategories,
          usage,
        };
      }

      // Return expenses array with usage at the same level
      return {
        expenses: validatedExpenses,
        usage,
      };
    } catch (error) {
      logger.error('Error parsing expense', { error });
      return {
        error: 'Parsing failed',
        message: 'Failed to parse expense. Please try again.',
      };
    }
  }

  static async getChatResponse(
    userMessage: string,
    conversationHistory: any[]
  ): Promise<{ response: string; usage?: any }> {
    if (!openai) {
      return {
        response: 'OpenAI API key not configured. Cannot provide chat responses.',
      };
    }

    try {
      const messages = [
        {
          role: 'system' as const,
          content:
            'You are a helpful expense tracking assistant. Help users log their expenses naturally. Be concise and friendly.',
        },
        ...conversationHistory,
        { role: 'user' as const, content: userMessage },
      ];

      const completion = await openai.chat.completions.create({
        // model: 'gpt-3.5-turbo',
        model: 'GPT-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 150,
      });

      // Get actual token usage from OpenAI
      const usage = completion.usage;
      logger.info('OpenAI chat response completed', {
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        total_tokens: usage?.total_tokens,
      });

      return {
        response:
          completion.choices[0]?.message?.content || "I'm here to help track your expenses!",
        usage,
      };
    } catch (error) {
      logger.error('Error getting chat response', { error });
      return {
        response: "Sorry, I'm having trouble responding right now.",
      };
    }
  }
}
