import mongoose, { Schema, Document } from 'mongoose';

/**
 * Payment Method Enum
 */
export enum PaymentMethod {
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  UPI = 'UPI',
  NET_BANKING = 'Net Banking',
  WALLET = 'Wallet',
  OTHER = 'Other',
}

/**
 * User Selected Plan Enum
 */
export enum UserSelectedPlan {
  PRO = 'pro',
  BUSINESS_PRO = 'businesspro',
}

/**
 * Plan Duration Enum
 */
export enum PlanDuration {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/**
 * Payment State Enum
 */
export enum PaymentState {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

/**
 * Payment Type Enum
 */
export enum PaymentType {
  ONETIME = 'onetime',
  SUBSCRIPTION = 'subscription',
}

/**
 * Currency Enum
 */
export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

/**
 * Card Store Interface (GDPR Compliant - Tokenized)
 */
export interface ICardStore {
  token: string; // Payment gateway token (never store raw card details)
  last4: string; // Last 4 digits for display
  brand: string; // Visa, Mastercard, etc.
  expiryMonth?: number;
  expiryYear?: number;
}

/**
 * Payment Document Interface
 */
export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  paymentUsing: PaymentMethod;
  cardStore?: ICardStore; // Optional, only for card payments
  paymentDate: Date;
  timestamp: Date;
  paymentId: string; // Unique payment ID from gateway
  userSelectedPlan: UserSelectedPlan;
  planDuration: PlanDuration;
  discount: number; // Discount amount
  couponCode?: string;
  paymentCountry: string; // ISO country code
  amount: number;
  currency: Currency;
  paymentState: PaymentState;
  paymentStateReason: string; // Reason for current state
  paymentType: PaymentType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment Schema
 */
const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    paymentUsing: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    cardStore: {
      token: { type: String },
      last4: { type: String },
      brand: { type: String },
      expiryMonth: { type: Number },
      expiryYear: { type: Number },
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userSelectedPlan: {
      type: String,
      enum: Object.values(UserSelectedPlan),
      required: true,
    },
    planDuration: {
      type: String,
      enum: Object.values(PlanDuration),
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
      trim: true,
    },
    paymentCountry: {
      type: String,
      required: true,
      length: 2, // ISO 3166-1 alpha-2 country code
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      required: true,
      default: Currency.INR,
    },
    paymentState: {
      type: String,
      enum: Object.values(PaymentState),
      required: true,
      default: PaymentState.INITIATED,
    },
    paymentStateReason: {
      type: String,
      required: true,
      default: 'Payment initiated',
    },
    paymentType: {
      type: String,
      enum: Object.values(PaymentType),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying by state
PaymentSchema.index({ paymentState: 1, createdAt: 1 });

// Index for user's payment history
PaymentSchema.index({ userId: 1, createdAt: -1 });

const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);

export default PaymentModel;
