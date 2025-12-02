import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * Get Tracker Logs Query DTO
 */
export class GetTrackerLogsQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}
