import { Response } from 'express';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import supportService from './support.service';
import { TicketStatus, TicketType } from './support.models';

/**
 * Create Ticket Controller
 */
export const createTicketController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    const { type, subject, description, attachments } = req.body;

    if (!type || !subject || !description) {
      return badRequestResponse(res, null, 'Type, subject, and description are required');
    }

    const ticket = await supportService.createTicket(
      userId,
      type,
      subject,
      description,
      attachments || []
    );

    // Get user details for emails
    const userDetails = req.user; // Contains name, email from JWT token

    // Send confirmation email to user (async, don't wait)
    const { sendSupportTicketUserEmail, sendSupportTicketAgentEmail } =
      await import('../../services/emailService');

    sendSupportTicketUserEmail(userDetails.email || '', {
      ticketId: ticket.ticketId,
      userName: userDetails.name || 'User',
      type: ticket.type,
      subject: ticket.subject,
    }).catch(error => {
      console.error('Failed to send user confirmation email:', error);
    });

    // Send notification email to support agent (async, don't wait)
    sendSupportTicketAgentEmail({
      ticketId: ticket.ticketId,
      userName: userDetails.name || 'User',
      userEmail: userDetails.email || '',
      type: ticket.type,
      subject: ticket.subject,
      description: ticket.description,
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    }).catch(error => {
      console.error('Failed to send agent notification email:', error);
    });

    return successResponse(
      res,
      {
        ticketId: ticket.ticketId,
        type: ticket.type,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        attachments: ticket.attachments,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
      'Ticket created successfully'
    );
  } catch (error: any) {
    console.error('Error in createTicketController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to create ticket');
  }
};

/**
 * Get All Tickets Controller
 * Returns user's tickets or all tickets (for admin)
 */
export const getAllTicketsController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    const status = req.query.status as TicketStatus | undefined;
    const type = req.query.type as TicketType | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    let result;
    if (userRole === 'admin') {
      // Admin sees all tickets
      result = await supportService.getAllTickets(status, type, limit, skip);
    } else {
      // Regular users see only their tickets
      result = await supportService.getUserTickets(userId, status, type, limit, skip);
    }

    const formattedTickets = result.tickets.map((ticket: any) => ({
      ticketId: ticket.ticketId,
      user: {
        id: ticket.userId._id,
        name: ticket.userId.name,
        email: ticket.userId.email,
      },
      type: ticket.type,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      attachments: ticket.attachments,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }));

    return successResponse(
      res,
      {
        tickets: formattedTickets,
        total: result.total,
        limit,
        skip,
      },
      'Tickets retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error in getAllTicketsController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to retrieve tickets');
  }
};

/**
 * Get Ticket By ID Controller
 */
export const getTicketByIdController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { ticketId } = req.params;

    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    // Admin can view any ticket, users can only view their own
    const ticket = await supportService.getTicketById(
      ticketId,
      userRole === 'admin' ? undefined : userId
    );

    if (!ticket) {
      return badRequestResponse(res, null, 'Ticket not found');
    }

    return successResponse(
      res,
      {
        ticketId: ticket.ticketId,
        user: {
          id: (ticket.userId as any)._id,
          name: (ticket.userId as any).name,
          email: (ticket.userId as any).email,
        },
        type: ticket.type,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        attachments: ticket.attachments,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
      'Ticket retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error in getTicketByIdController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to retrieve ticket');
  }
};

/**
 * Update Ticket Status Controller
 */
export const updateTicketStatusController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    if (!status) {
      return badRequestResponse(res, null, 'Status is required');
    }

    if (!Object.values(TicketStatus).includes(status)) {
      return badRequestResponse(res, null, 'Invalid status value');
    }

    const ticket = await supportService.updateTicketStatus(ticketId, userId, status);

    if (!ticket) {
      return badRequestResponse(res, null, 'Ticket not found or unauthorized');
    }

    return successResponse(
      res,
      {
        ticketId: ticket.ticketId,
        status: ticket.status,
        updatedAt: ticket.updatedAt,
      },
      'Ticket status updated successfully'
    );
  } catch (error: any) {
    console.error('Error in updateTicketStatusController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to update ticket status');
  }
};

/**
 * Add Attachment Controller
 */
export const addAttachmentController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { ticketId } = req.params;
    const attachment = req.body;

    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    if (!attachment.fileId || !attachment.filePath || !attachment.fileName || !attachment.fileUrl) {
      return badRequestResponse(res, null, 'Complete attachment information required');
    }

    const ticket = await supportService.addAttachment(ticketId, userId, attachment);

    if (!ticket) {
      return badRequestResponse(res, null, 'Ticket not found or unauthorized');
    }

    return successResponse(
      res,
      {
        ticketId: ticket.ticketId,
        attachments: ticket.attachments,
      },
      'Attachment added successfully'
    );
  } catch (error: any) {
    console.error('Error in addAttachmentController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to add attachment');
  }
};

/**
 * Add Update Controller
 */
export const addUpdateController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { ticketId } = req.params;
    const { message, addedBy } = req.body;

    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    if (!message || !addedBy) {
      return badRequestResponse(res, null, 'Message and addedBy are required');
    }

    if (addedBy !== 'user' && addedBy !== 'agent') {
      return badRequestResponse(res, null, 'addedBy must be either "user" or "agent"');
    }

    const ticket = await supportService.addUpdate(ticketId, userId, message, addedBy);

    if (!ticket) {
      return badRequestResponse(res, null, 'Ticket not found or unauthorized');
    }

    return successResponse(
      res,
      {
        ticketId: ticket.ticketId,
        updates: ticket.updates,
      },
      'Update added successfully'
    );
  } catch (error: any) {
    console.error('Error in addUpdateController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to add update');
  }
};

/**
 * Delete Ticket Controller (Admin only)
 */
export const deleteTicketController = async (req: any, res: Response) => {
  try {
    const { ticketId } = req.params;

    const deleted = await supportService.deleteTicket(ticketId);

    if (!deleted) {
      return badRequestResponse(res, null, 'Ticket not found');
    }

    return successResponse(res, null, 'Ticket deleted successfully');
  } catch (error: any) {
    console.error('Error in deleteTicketController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to delete ticket');
  }
};

/**
 * Get Ticket Statistics Controller
 */
export const getTicketStatsController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return badRequestResponse(res, null, 'User ID not found');
    }

    // Admin gets global stats, users get their own stats
    const stats = await supportService.getTicketStats(userRole === 'admin' ? undefined : userId);

    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error in getTicketStatsController:', error);
    return errorResponse(res, { error: error.message }, 'Failed to retrieve statistics');
  }
};
