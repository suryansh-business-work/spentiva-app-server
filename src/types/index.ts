export interface Expense {
  id: string;
  amount: number;
  category: string;
  subcategory: string;
  categoryId: string;
  paymentMethod: string;
  description?: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ParsedExpense {
  amount: number;
  category: string;
  subcategory: string;
  categoryId: string;
  paymentMethod: string; // Required - defaults to "User not provided payment method"
  description?: string;
  timestamp?: Date;
}
