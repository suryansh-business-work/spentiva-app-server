import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, IsBoolean } from 'class-validator';

/**
 * DTO for getting user statistics with filters
 */
export class GetUsersStatsDto {
  @IsOptional()
  @IsEnum(['today', 'yesterday', 'last7days', 'month', 'year', 'custom'])
  filter?: 'today' | 'yesterday' | 'last7days' | 'month' | 'year' | 'custom';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * DTO for getting all users with pagination
 */
export class GetAllUsersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: 'user' | 'admin';

  @IsOptional()
  @IsEnum(['free', 'pro', 'businesspro'])
  accountType?: 'free' | 'pro' | 'businesspro';

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}

/**
 * DTO for updating user
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: 'user' | 'admin';

  @IsOptional()
  @IsEnum(['free', 'pro', 'businesspro'])
  accountType?: 'free' | 'pro' | 'businesspro';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
