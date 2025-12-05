"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseParser = void 0;
const openai_1 = __importDefault(require("openai"));
const categories_1 = require("../config/categories");
const env_1 = __importDefault(require("../config/env"));
const logger_1 = require("../utils/logger");
const openai = env_1.default.OPENAI_API_KEY ? new openai_1.default({ apiKey: env_1.default.OPENAI_API_KEY }) : null;
class ExpenseParser {
    static buildSystemPrompt(categories) {
        const categoriesList = categories
            .map(cat => {
            const subcats = cat.subcategories?.map((s) => s.name).join(', ') || '';
            return `${cat.name}: ${subcats}`;
        })
            .join('\n');
        return `You are an expense tracking assistant. Parse user messages about expenses and extract:
1. Amount (number)
2. Category (main category from the list)
3. Subcategory (specific subcategory from the list)
4. Payment method (from: ${categories_1.PAYMENT_METHODS.join(', ')})
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
    static async parseExpense(userMessage, trackerId) {
        if (!openai) {
            return {
                error: 'OpenAI API key not configured. Cannot parse expense.',
            };
        }
        try {
            // Fetch categories dynamically if trackerId is provided
            let categories = [];
            if (trackerId) {
                const { CategoryService } = await Promise.resolve().then(() => __importStar(require('../apis/category/category.services')));
                categories = await CategoryService.getAllCategories(trackerId);
            }
            else {
                // Fallback to default categories if no trackerId (though trackerId should be required)
                categories = Object.values(categories_1.EXPENSE_CATEGORIES);
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
            // Get actual token usage from OpenAI
            const usage = completion.usage;
            logger_1.logger.info('OpenAI expense parsing completed', {
                prompt_tokens: usage?.prompt_tokens,
                completion_tokens: usage?.completion_tokens,
                total_tokens: usage?.total_tokens,
            });
            const parsed = JSON.parse(response);
            if (parsed.error) {
                return { ...parsed, usage };
            }
            // Validate the parsed expense
            if (!parsed.amount || !parsed.category || !parsed.subcategory || !parsed.paymentMethod) {
                return { error: 'Missing required fields in expense', usage };
            }
            // Find the category ID from the fetched categories
            const categoryEntry = categories.find(cat => cat.name === parsed.category);
            if (!categoryEntry) {
                return {
                    error: 'I was unable to find this category in your category list. Kindly update the categories before logging this item.',
                    usage,
                };
            }
            // Add categoryId, timestamp, and token usage
            const result = {
                ...parsed,
                categoryId: categoryEntry._id || categoryEntry.id, // Handle both _id (DB) and id (Config)
                timestamp: new Date(),
                usage, // Include actual OpenAI token usage
            };
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error parsing expense', { error });
            return { error: 'Failed to parse expense. Please try again.' };
        }
    }
    static async getChatResponse(userMessage, conversationHistory) {
        if (!openai) {
            return {
                response: 'OpenAI API key not configured. Cannot provide chat responses.',
            };
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
            // Get actual token usage from OpenAI
            const usage = completion.usage;
            logger_1.logger.info('OpenAI chat response completed', {
                prompt_tokens: usage?.prompt_tokens,
                completion_tokens: usage?.completion_tokens,
                total_tokens: usage?.total_tokens,
            });
            return {
                response: completion.choices[0]?.message?.content || "I'm here to help track your expenses!",
                usage,
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting chat response', { error });
            return {
                response: "Sorry, I'm having trouble responding right now.",
            };
        }
    }
}
exports.ExpenseParser = ExpenseParser;
