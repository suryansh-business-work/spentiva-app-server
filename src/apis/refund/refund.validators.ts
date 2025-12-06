import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsMongoId,
  IsISO8601,
  IsInt,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RefundStatus } from './refund.models';

/**
 * Create Refund DTO
 */
export class CreateRefundDto {
  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  refundAmount!: number;

  @IsString()
  @IsNotEmpty()
  refundReason!: string;

  @IsString()
  @IsNotEmpty()
  refundId!: string;

  @IsEnum(RefundStatus)
  @IsOptional()
  refundStatus?: RefundStatus;
}

/**
 * Update Refund Status DTO
 */
export class UpdateRefundStatusDto {
  @IsEnum(RefundStatus)
  @IsNotEmpty()
  status!: RefundStatus;

  @IsISO8601()
  @IsOptional()
  refundDate?: string;
}

/**
 * Get User Refunds Query DTO
 */
export class GetUserRefundsQueryDto {
  @IsEnum(RefundStatus)
  @IsOptional()
  status?: RefundStatus;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

/**
 * Get All Refunds Query DTO (Admin)
 */
export class GetAllRefundsQueryDto {
  @IsEnum(RefundStatus)
  @IsOptional()
  status?: RefundStatus;

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
