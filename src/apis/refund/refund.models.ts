import mongoose, { Schema, Document } from 'mongoose';

/**
 * Refund Status Enum
 */
export enum RefundStatus {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Refund Document Interface
 */
export interface IRefund extends Document {
  paymentId: string; // Reference to payment
  userId: mongoose.Types.ObjectId;
  refundAmount: number;
  refundStatus: RefundStatus;
  refundReason: string;
  refundDate?: Date; // Actual refund completion date
  refundId: string; // Unique refund ID from gateway
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refund Schema
 */
const RefundSchema = new Schema<IRefund>(
  {
    paymentId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    refundStatus: {
      type: String,
      enum: Object.values(RefundStatus),
      required: true,
      default: RefundStatus.INITIATED,
    },
    refundReason: {
      type: String,
      required: true,
    },
    refundDate: {
      type: Date,
    },
    refundId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying refunds by payment
RefundSchema.index({ paymentId: 1, createdAt: -1 });

const RefundModel = mongoose.model<IRefund>('Refund', RefundSchema);

export default RefundModel;
