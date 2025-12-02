import { IsNumber, IsString, IsOptional, IsNotEmpty, IsDateString, Min } from 'class-validator';

/**
 * Parse Expense DTO
 */
export class ParseExpenseDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  trackerId!: string;
}

/**
 * Create Expense DTO
 */
export class CreateExpenseDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  subcategory!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  trackerId?: string;
}

/**
 * Update Expense DTO
 */
export class UpdateExpenseDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

/**
 * Chat DTO
 */
export class ChatDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  history?: any[];

  @IsString()
  @IsOptional()
  trackerId?: string;
}
