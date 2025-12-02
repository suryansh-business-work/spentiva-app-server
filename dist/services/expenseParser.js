"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseParser = void 0;
const openai_1 = __importDefault(require("openai"));
const categories_1 = require("../config/categories");
const env_1 = __importDefault(require("../config/env"));
const openai = env_1.default.OPENAI_API_KEY ? new openai_1.default({ apiKey: env_1.default.OPENAI_API_KEY }) : null;
class ExpenseParser {
    static buildSystemPrompt() {
        const categories = Object.values(categories_1.EXPENSE_CATEGORIES)
            .map(cat => {
            return `${cat.name}: ${cat.subcategories.join(', ')}`;
        })
            .join('\n');
        return `You are an expense tracking assistant. Parse user messages about expenses and extract:
1. Amount (number)
2. Category (main category from the list)
3. Subcategory (specific subcategory from the list)
4. Payment method (from: ${categories_1.PAYMENT_METHODS.join(', ')})
5. Description (optional)

Available categories and subcategories:
${categories}

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

If you cannot parse the message, respond with:
{
  "error": "Could not understand the expense. Please provide amount, category, and payment method."
}`;
    }
    static async parseExpense(userMessage) {
        if (!openai) {
            return {
                error: 'OpenAI API key not configured. Cannot parse expense.',
            };
        }
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: this.buildSystemPrompt() },
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
            // Find the category ID
            const categoryEntry = Object.values(categories_1.EXPENSE_CATEGORIES).find(cat => cat.name === parsed.category);
            if (!categoryEntry) {
                return { error: 'Invalid category' };
            }
            // Add categoryId and timestamp
            const result = {
                ...parsed,
                categoryId: categoryEntry.id,
                timestamp: new Date(),
            };
            return result;
        }
        catch (error) {
            console.error('Error parsing expense:', error);
            return { error: 'Failed to parse expense. Please try again.' };
        }
    }
    static async getChatResponse(userMessage, conversationHistory) {
        if (!openai) {
            return 'OpenAI API key not configured. Cannot provide chat responses.';
        }
        try {
            const messages = [
                {
                    role: 'system',
                    content: 'You are a helpful expense tracking assistant. Help users log their expenses naturally. Be concise and friendly.',
                },
                ...conversationHistory,
                { role: 'user', content: userMessage },
            ];
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages,
                temperature: 0.7,
                max_tokens: 150,
            });
            return completion.choices[0]?.message?.content || "I'm here to help track your expenses!";
        }
        catch (error) {
            console.error('Error getting chat response:', error);
            return "Sorry, I'm having trouble responding right now.";
        }
    }
}
exports.ExpenseParser = ExpenseParser;
