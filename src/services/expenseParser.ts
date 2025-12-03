import OpenAI from 'openai';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../config/categories';
import { ParsedExpense } from '../types';
import config from '../config/env';

const openai = config.OPENAI_API_KEY ? new OpenAI({ apiKey: config.OPENAI_API_KEY }) : null;

export class ExpenseParser {
  private static buildSystemPrompt(categories: any[]): string {
    const categoriesList = categories
      .map(cat => {
        const subcats = cat.subcategories?.map((s: any) => s.name).join(', ') || '';
        return `${cat.name}: ${subcats}`;
      })
      .join('\n');

    return `You are an expense tracking assistant. Parse user messages about expenses and extract:
1. Amount (number)
2. Category (main category from the list)
3. Subcategory (specific subcategory from the list)
4. Payment method (from: ${PAYMENT_METHODS.join(', ')})
5. Description (optional)

Available categories and subcategories:
${categoriesList}

Examples:
- "spend food 50 from credit card" → {amount: 50, category: "Food & Dining", subcategory: "Foods", paymentMethod: "Credit Card"}
- "bought groceries 200 cash" → {amount: 200, category: "Food & Dining", subcategory: "Grocery & Vegetables", paymentMethod: "Cash"}
- "paid electricity bill 1500 upi" → {amount: 1500, category: "Home & Living", subcategory: "Bills", paymentMethod: "UPI"}

Respond ONLY with a JSON object in this exact format:
{
  "amount": number,
  "category": "string",
  "subcategory": "string",
  "paymentMethod": "string",
  "description": "string (optional)"
}

If the category or subcategory is NOT in the provided list, respond with:
{
  "error": "I was unable to find this category in your category list. Kindly update the categories before logging this item."
}

If you cannot parse the message for other reasons, respond with:
{
  "error": "Could not understand the expense. Please provide amount, category, and payment method."
}`;
  }

  static async parseExpense(
    userMessage: string,
    trackerId?: string
  ): Promise<ParsedExpense | { error: string }> {
    if (!openai) {
      return {
        error: 'OpenAI API key not configured. Cannot parse expense.',
      };
    }

    try {
      // Fetch categories dynamically if trackerId is provided
      let categories: any[] = [];
      if (trackerId) {
        const { CategoryService } = await import('../apis/category/category.services');
        categories = await CategoryService.getAllCategories(trackerId);
      } else {
        // Fallback to default categories if no trackerId (though trackerId should be required)
        categories = Object.values(EXPENSE_CATEGORIES);
      }

      if (!categories || categories.length === 0) {
        return {
          error: 'No categories found for this tracker. Please add categories first.',
        };
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.buildSystemPrompt(categories) },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return { error: 'No response from AI' };
      }

      const parsed = JSON.parse(response);

      if (parsed.error) {
        return parsed;
      }

      // Validate the parsed expense
      if (!parsed.amount || !parsed.category || !parsed.subcategory || !parsed.paymentMethod) {
        return { error: 'Missing required fields in expense' };
      }

      // Find the category ID from the fetched categories
      const categoryEntry = categories.find(cat => cat.name === parsed.category);

      if (!categoryEntry) {
        return {
          error:
            'I was unable to find this category in your category list. Kindly update the categories before logging this item.',
        };
      }

      // Add categoryId and timestamp
      const result: ParsedExpense = {
        ...parsed,
        categoryId: categoryEntry._id || categoryEntry.id, // Handle both _id (DB) and id (Config)
        timestamp: new Date(),
      };

      return result;
    } catch (error) {
      console.error('Error parsing expense:', error);
      return { error: 'Failed to parse expense. Please try again.' };
    }
  }

  static async getChatResponse(userMessage: string, conversationHistory: any[]): Promise<string> {
    if (!openai) {
      return 'OpenAI API key not configured. Cannot provide chat responses.';
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
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 150,
      });

      return completion.choices[0]?.message?.content || "I'm here to help track your expenses!";
    } catch (error) {
      console.error('Error getting chat response:', error);
      return "Sorry, I'm having trouble responding right now.";
    }
  }
}
