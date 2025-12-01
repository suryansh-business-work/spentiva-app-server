import mongoose, { Schema, Document } from 'mongoose';

export interface ITracker extends Document {
  name: string;
  type: 'personal' | 'business';
  description?: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrackerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['personal', 'business'],
      default: 'personal'
    },
    description: {
      type: String,
      trim: true
    },
    currency: {
      type: String,
      required: true,
      enum: ['INR', 'USD', 'EUR', 'GBP'],
      default: 'INR'
    },
    userId: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
TrackerSchema.index({ createdAt: -1 });
TrackerSchema.index({ type: 1 });
TrackerSchema.index({ userId: 1 });

export default mongoose.model<ITracker>('Tracker', TrackerSchema);
