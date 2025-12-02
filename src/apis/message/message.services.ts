import MessageModel from './message.models';
import mongoose from 'mongoose';

/**
 * Message Service - Business logic for messages
 */
export class MessageService {
  /**
   * Get all messages for a user with optional filtering
   */
  static async getAllMessages(filters: { userId?: string; trackerId?: string; limit?: number }) {
    const { userId, trackerId, limit = 100 } = filters;
    const query: any = {};

    if (userId) query.userId = new mongoose.Types.ObjectId(userId);
    if (trackerId) query.trackerId = trackerId;

    const messages = await MessageModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return messages;
  }

  /**
   * Get a specific message by ID
   */
  static async getMessageById(messageId: string, userId?: string) {
    const query: any = { _id: messageId };
    if (userId) query.userId = new mongoose.Types.ObjectId(userId);

    const message = await MessageModel.findOne(query);
    if (!message) {
      throw new Error('Message not found');
    }
    return message;
  }

  /**
   * Create a new message
   */
  static async createMessage(data: {
    userId: string;
    trackerId: string;
    role: 'user' | 'assistant';
    content: string;
    tokenCount: number;
    timestamp?: Date;
  }) {
    const { userId, trackerId, role, content, tokenCount, timestamp } = data;

    if (!userId || !trackerId || !role || !content) {
      throw new Error('Missing required fields: userId, trackerId, role, content');
    }

    const message = await MessageModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      trackerId,
      role,
      content,
      tokenCount: tokenCount || 0,
      timestamp: timestamp || new Date()
    });

    return message;
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string, userId?: string) {
    const query: any = { _id: messageId };
    if (userId) query.userId = new mongoose.Types.ObjectId(userId);

    const message = await MessageModel.findOneAndDelete(query);

    if (!message) {
      throw new Error('Message not found');
    }

    return { message: 'Message deleted successfully' };
  }

  /**
   * Get message count for a user
   */
  static async getMessageCount(userId: string, trackerId?: string) {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (trackerId) query.trackerId = trackerId;

    const count = await MessageModel.countDocuments(query);
    return count;
  }
}

export default MessageService;
