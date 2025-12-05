import {
  SupportTicketModel,
  TicketCounterModel,
  ISupportTicket,
  TicketStatus,
  TicketType,
  IAttachment,
  IUpdate,
} from './support.models';

/**
 * Support Service
 * Handles support ticket business logic
 */
class SupportService {
  /**
   * Generate unique ticket ID
   */
  private async generateTicketId(): Promise<string> {
    const counter = await TicketCounterModel.findByIdAndUpdate(
      'ticketId',
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );
    const paddedNumber = String(counter.sequence).padStart(3, '0');
    return `TICKET-${paddedNumber}`;
  }

  /**
   * Create a new support ticket
   */
  async createTicket(
    userId: string,
    type: TicketType,
    subject: string,
    description: string,
    attachments: IAttachment[] = []
  ): Promise<ISupportTicket> {
    try {
      const ticketId = await this.generateTicketId();

      const ticket = new SupportTicketModel({
        ticketId,
        userId,
        type,
        subject,
        description,
        status: TicketStatus.OPEN,
        attachments,
      });

      await ticket.save();
      return ticket;
    } catch (error) {
      throw new Error(`Failed to create ticket: ${error}`);
    }
  }

  /**
   * Get all tickets for a user
   */
  async getUserTickets(
    userId: string,
    status?: TicketStatus,
    type?: TicketType,
    limit: number = 50,
    skip: number = 0
  ): Promise<{ tickets: ISupportTicket[]; total: number }> {
    try {
      const filter: any = { userId };

      if (status) {
        filter.status = status;
      }

      if (type) {
        filter.type = type;
      }

      const tickets = await SupportTicketModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'name email');

      const total = await SupportTicketModel.countDocuments(filter);

      return { tickets, total };
    } catch (error) {
      throw new Error(`Failed to get user tickets: ${error}`);
    }
  }

  /**
   * Get all tickets (admin view)
   */
  async getAllTickets(
    status?: TicketStatus,
    type?: TicketType,
    limit: number = 50,
    skip: number = 0
  ): Promise<{ tickets: ISupportTicket[]; total: number }> {
    try {
      const filter: any = {};

      if (status) {
        filter.status = status;
      }

      if (type) {
        filter.type = type;
      }

      const tickets = await SupportTicketModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'name email');

      const total = await SupportTicketModel.countDocuments(filter);

      return { tickets, total };
    } catch (error) {
      throw new Error(`Failed to get all tickets: ${error}`);
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: string, userId?: string): Promise<ISupportTicket | null> {
    try {
      const filter: any = { ticketId };

      // If userId provided, ensure user owns the ticket
      if (userId) {
        filter.userId = userId;
      }

      const ticket = await SupportTicketModel.findOne(filter).populate('userId', 'name email');
      return ticket;
    } catch (error) {
      throw new Error(`Failed to get ticket: ${error}`);
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    userId: string,
    newStatus: TicketStatus
  ): Promise<ISupportTicket | null> {
    try {
      const ticket = await SupportTicketModel.findOneAndUpdate(
        { ticketId, userId },
        { status: newStatus },
        { new: true }
      ).populate('userId', 'name email');

      return ticket;
    } catch (error) {
      throw new Error(`Failed to update ticket status: ${error}`);
    }
  }

  /**
   * Add attachment to ticket
   */
  async addAttachment(
    ticketId: string,
    userId: string,
    attachment: IAttachment
  ): Promise<ISupportTicket | null> {
    try {
      const ticket = await SupportTicketModel.findOneAndUpdate(
        { ticketId, userId },
        { $push: { attachments: attachment } },
        { new: true }
      ).populate('userId', 'name email');

      return ticket;
    } catch (error) {
      throw new Error(`Failed to add attachment: ${error}`);
    }
  }

  /**
   * Add update message to ticket
   */
  async addUpdate(
    ticketId: string,
    userId: string,
    message: string,
    addedBy: 'user' | 'agent'
  ): Promise<ISupportTicket | null> {
    try {
      const update: IUpdate = {
        message,
        addedBy,
        addedAt: new Date(),
      };

      const ticket = await SupportTicketModel.findOneAndUpdate(
        { ticketId, userId },
        { $push: { updates: update } },
        { new: true }
      ).populate('userId', 'name email');

      return ticket;
    } catch (error) {
      throw new Error(`Failed to add update: ${error}`);
    }
  }

  /**
   * Delete ticket (admin only)
   */
  async deleteTicket(ticketId: string): Promise<boolean> {
    try {
      const result = await SupportTicketModel.deleteOne({ ticketId });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete ticket: ${error}`);
    }
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats(userId?: string): Promise<any> {
    try {
      const filter: any = userId ? { userId } : {};

      const stats = await SupportTicketModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const statsMap: any = {
        open: 0,
        inProgress: 0,
        closed: 0,
        escalated: 0,
        total: 0,
      };

      stats.forEach((stat: any) => {
        const status = stat._id.toLowerCase();
        statsMap[status] = stat.count;
        statsMap.total += stat.count;
      });

      return statsMap;
    } catch (error) {
      throw new Error(`Failed to get ticket stats: ${error}`);
    }
  }
}

export default new SupportService();
