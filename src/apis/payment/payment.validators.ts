import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsMongoId,
  IsISO8601,
  Length,
  IsObject,
  ValidateNested,
  IsInt,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PaymentMethod,
  UserSelectedPlan,
  PlanDuration,
  PaymentState,
  PaymentType,
  Currency,
} from './payment.models';

/**
 * Card Store DTO (GDPR Compliant)
 */
export class CardStoreDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @Length(4, 4)
  last4!: string;

  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsInt()
  @IsOptional()
  expiryMonth?: number;

  @IsInt()
  @IsOptional()
  expiryYear?: number;
}

/**
 * Create Payment DTO
 */
export class CreatePaymentDto {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentUsing!: PaymentMethod;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CardStoreDto)
  cardStore?: CardStoreDto;

  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @IsEnum(UserSelectedPlan)
  @IsNotEmpty()
  userSelectedPlan!: UserSelectedPlan;

  @IsEnum(PlanDuration)
  @IsNotEmpty()
  planDuration!: PlanDuration;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  paymentCountry!: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount!: number;

  @IsEnum(Currency)
  @IsNotEmpty()
  currency!: Currency;

  @IsEnum(PaymentState)
  @IsOptional()
  paymentState?: PaymentState;

  @IsString()
  @IsOptional()
  paymentStateReason?: string;

  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType!: PaymentType;
}

/**
 * Update Payment State DTO
 */
export class UpdatePaymentStateDto {
  @IsEnum(PaymentState)
  @IsNotEmpty()
  state!: PaymentState;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

/**
 * Get User Payments Query DTO
 */
export class GetUserPaymentsQueryDto {
  @IsEnum(PaymentState)
  @IsOptional()
  state?: PaymentState;

  @IsEnum(UserSelectedPlan)
  @IsOptional()
  planType?: UserSelectedPlan;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

/**
 * Get All Payments Query DTO (Admin)
 */
export class GetAllPaymentsQueryDto {
  @IsEnum(PaymentState)
  @IsOptional()
  state?: PaymentState;

  @IsEnum(UserSelectedPlan)
  @IsOptional()
  planType?: UserSelectedPlan;

  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  skip?: number;
}

/**
 * Expire Pending Payments Query DTO
 */
export class ExpirePendingPaymentsQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  expiryMinutes?: number;
}
