import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

/**
 * DTO for querying user files
 */
export class GetUserFilesDto {
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
 * DTO for file ID parameter
 */
export class FileIdDto {
  @IsString()
  id!: string;
}
