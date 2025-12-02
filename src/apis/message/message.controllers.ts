import { Response } from 'express';
import MessageService from './message.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';

/**
 * Message Controllers - Request handlers using response-object.ts
 */

/**
 * Get all messages with optional filtering
 */
export const getAllMessagesController = async (req: any, res: Response) => {
  try {
    const { trackerId, limit } = req.query;
    const userId = req.user?.userId;

    const messages = await MessageService.getAllMessages({
      userId,
      trackerId: trackerId as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    // Format messages to show content preview
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      trackerId: msg.trackerId,
      role: msg.role,
      tokenCount: msg.tokenCount,
      timestamp: msg.timestamp,
      contentPreview: msg.content.substring(0, 50),
    }));

    return successResponse(res, { messages: formattedMessages }, 'Messages retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get message count for debugging
 */
export const getMessageCountController = async (req: any, res: Response) => {
  try {
    const { trackerId } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      return badRequestResponse(res, null, 'User ID required');
    }

    const count = await MessageService.getMessageCount(userId, trackerId as string);

    return successResponse(res, { count }, 'Message count retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching message count:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Create a new message
 */
export const createMessageController = async (req: any, res: Response) => {
  try {
    const { trackerId, role, content, tokenCount, timestamp } = req.body;
    const userId = req.user?.userId;

    const message = await MessageService.createMessage({
      userId,
      trackerId,
      role,
      content,
      tokenCount,
      timestamp,
    });

    // Return response
    return successResponse(res, { message }, 'Message created successfully');
  } catch (error: any) {
    console.error('Error creating message:', error);
    if (error.message.includes('Missing required fields')) {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Delete a message
 */
export const deleteMessageController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await MessageService.deleteMessage(id, userId);

    return successResponse(res, result, result.message);
  } catch (error: any) {
    console.error('Error deleting message:', error);
    if (error.message === 'Message not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};
