import mongoose, { Schema, Document } from 'mongoose';

/**
 * Ticket Type Enum
 */
export enum TicketType {
  PAYMENT_RELATED = 'PaymentRelated',
  BUG_IN_APP = 'BugInApp',
  DATA_LOSS = 'DataLoss',
  FEATURE_REQUEST = 'FeatureRequest',
  OTHER = 'Other',
}

/**
 * Ticket Status Enum
 */
export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress',
  CLOSED = 'Closed',
  ESCALATED = 'Escalated',
}

/**
 * Attachment Interface
 */
export interface IAttachment {
  fileId: string;
  filePath: string;
  fileName: string;
  fileUrl: string;
}

/**
 * Update Message Interface
 */
export interface IUpdate {
  message: string;
  addedBy: string; // 'user' or 'agent'
  addedAt: Date;
}

/**
 * Support Ticket Interface
 */
export interface ISupportTicket extends Document {
  ticketId: string;
  userId: mongoose.Types.ObjectId;
  type: TicketType;
  subject: string;
  description: string;
  status: TicketStatus;
  attachments: IAttachment[];
  updates: IUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Support Ticket Schema
 */
const SupportTicketSchema: Schema = new Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TicketType),
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
    },
    attachments: [
      {
        fileId: { type: String, required: true },
        filePath: { type: String, required: true },
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
      },
    ],
    updates: [
      {
        message: { type: String, required: true },
        addedBy: { type: String, required: true, enum: ['user', 'agent'] },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
SupportTicketSchema.index({ userId: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ type: 1 });

export const SupportTicketModel = mongoose.model<ISupportTicket>(
  'SupportTicket',
  SupportTicketSchema
);

/**
 * Ticket Counter Schema for auto-incrementing ticket IDs
 */
interface ITicketCounter extends Document {
  sequence: number;
}

const TicketCounterSchema: Schema = new Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 },
});

export const TicketCounterModel = mongoose.model<ITicketCounter>(
  'TicketCounter',
  TicketCounterSchema
);
