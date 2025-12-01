import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  trackerId: string;
  role: 'user' | 'assistant';
  content: string;
  tokenCount: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    trackerId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokenCount: {
      type: Number,
      required: true,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
messageSchema.index({ userId: 1, trackerId: 1, timestamp: -1 });
messageSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);
