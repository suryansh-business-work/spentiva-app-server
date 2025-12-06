import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketType, TicketStatus } from './support.models';

/**
 * Attachment DTO
 */
export class AttachmentDto {
  @IsString()
  fileId!: string;

  @IsString()
  filePath!: string;

  @IsString()
  fileName!: string;

  @IsString()
  fileUrl!: string;
}

/**
 * Create Ticket DTO
 */
export class CreateTicketDto {
  @IsEnum(TicketType)
  type!: TicketType;

  @IsString()
  subject!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

/**
 * Update Ticket Status DTO
 */
export class UpdateStatusDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}

/**
 * Get Tickets Query DTO
 */
export class GetTicketsDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;
}

/**
 * Add Attachment DTO
 */
export class AddAttachmentDto {
  @IsString()
  fileId!: string;

  @IsString()
  filePath!: string;

  @IsString()
  fileName!: string;

  @IsString()
  fileUrl!: string;
}

/**
 * Add Update DTO
 */
export class AddUpdateDto {
  @IsString()
  message!: string;

  @IsString()
  addedBy!: 'user' | 'agent';
}
