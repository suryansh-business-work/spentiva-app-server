import { IsString, IsOptional, IsNumber, IsObject, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query DTO for fetching usage logs
 */
export class GetUsageLogsQueryDto {
  @IsString()
  @IsOptional()
  trackerId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

/**
 * Create Usage Log DTO
 */
export class CreateUsageLogDto {
  @IsObject()
  trackerSnapshot!: {
    trackerId: string;
    trackerName: string;
    trackerType: string;
    isDeleted?: boolean;
    deletedAt?: Date;
  };

  @IsString()
  @IsIn(['user', 'assistant'], { message: 'messageRole must be either "user" or "assistant"' })
  messageRole!: 'user' | 'assistant';

  @IsString()
  messageContent!: string;

  @IsNumber()
  tokenCount!: number;

  @IsOptional()
  timestamp?: Date;
}

/**
 * Delete Old Logs Query DTO
 */
export class DeleteOldLogsQueryDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  daysOld?: number;
}
