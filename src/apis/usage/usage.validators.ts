import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query DTO for pagination
 */
export class PaginationQueryDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

/**
 * Overall Usage Stats DTO
 */
export class OverallUsageStatsDto {
  totalMessages!: number;
  totalTokens!: number;
  userMessages!: number;
  aiMessages!: number;
}

/**
 * Tracker Usage Summary DTO
 */
export class TrackerUsageSummaryDto {
  trackerId!: string;
  trackerName!: string;
  trackerType!: string;
  isDeleted!: boolean;
  deletedAt?: Date | null;
  messageCount!: number;
  tokenCount!: number;
}

/**
 * Daily Usage Point DTO
 */
export class DailyUsagePointDto {
  date!: Date;
  messageCount!: number;
  tokenCount!: number;
}

/**
 * Message DTO
 */
export class MessageDto {
  _id!: string;
  role!: string;
  content!: string;
  tokenCount!: number;
  timestamp!: Date;
}

/**
 * Tracker Info DTO
 */
export class TrackerInfoDto {
  trackerId!: string;
  trackerName!: string;
  trackerType!: string;
  isDeleted!: boolean;
  deletedAt?: Date | null;
}

/**
 * Usage Graph Data Point DTO
 */
export class UsageGraphPointDto {
  label!: string; // Date label
  messages!: number;
  tokens!: number;
}

/**
 * Category Usage DTO (for graphs)
 */
export class CategoryUsageDto {
  category!: string;
  count!: number;
  percentage!: number;
}
