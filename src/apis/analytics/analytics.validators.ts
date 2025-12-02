import { IsString, IsOptional, IsInt, Min } from 'class-validator';

/**
 * Analytics Query DTO
 */
export class AnalyticsQueryDto {
  @IsString()
  @IsOptional()
  filter?: string;

  @IsString()
  @IsOptional()
  customStart?: string;

  @IsString()
  @IsOptional()
  customEnd?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  trackerId?: string;
}

/**
 * Monthly Analytics Query DTO
 */
export class MonthlyAnalyticsQueryDto {
  @IsInt()
  @Min(2000)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  trackerId?: string;
}
