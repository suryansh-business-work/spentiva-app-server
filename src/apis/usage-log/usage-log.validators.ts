import { IsString, IsEnum, IsNumber, IsOptional, IsNotEmpty, IsDateString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Tracker Snapshot DTO
 */
export class TrackerSnapshotDto {
  @IsString()
  @IsNotEmpty()
  trackerId!: string;

  @IsString()
  @IsNotEmpty()
  trackerName!: string;

  @IsString()
  @IsEnum(['business', 'personal'])
  trackerType!: string;

  @IsOptional()
  isDeleted?: boolean;

  @IsDateString()
  @IsOptional()
  deletedAt?: string;

  @IsDateString()
  @IsOptional()
  modifiedAt?: string;
}

/**
 * Create Usage Log DTO
 */
export class CreateUsageLogDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TrackerSnapshotDto)
  trackerSnapshot!: TrackerSnapshotDto;

  @IsEnum(['user', 'assistant'])
  messageRole!: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  messageContent!: string;

  @IsNumber()
  @IsOptional()
  tokenCount?: number;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}
