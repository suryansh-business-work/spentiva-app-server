import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  identifier: string; // phone or email
  otp: string;
  type: 'phone' | 'email';
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    identifier: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
      default: '123456', // Static OTP for now
    },
    type: {
      type: String,
      enum: ['phone', 'email'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ identifier: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTP>('OTP', otpSchema);
