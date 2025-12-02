import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * DTO for creating a tracker
 */
export class CreateTrackerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(['personal', 'business'])
  @IsNotEmpty()
  type!: 'personal' | 'business';

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['INR', 'USD', 'EUR', 'GBP'])
  @IsNotEmpty()
  currency!: 'INR' | 'USD' | 'EUR' | 'GBP';
}

/**
 * DTO for updating a tracker
 */
export class UpdateTrackerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(['personal', 'business'])
  @IsOptional()
  type?: 'personal' | 'business';

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['INR', 'USD', 'EUR', 'GBP'])
  @IsOptional()
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
}
