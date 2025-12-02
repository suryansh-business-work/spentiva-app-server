import { IsString, IsEnum, IsNumber, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

/**
 * Create Message DTO
 */
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  trackerId!: string;

  @IsEnum(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  @IsOptional()
  tokenCount?: number;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}
