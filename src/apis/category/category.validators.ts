import { IsString, IsArray, IsOptional, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * SubCategory DTO
 */
export class SubCategoryDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

/**
 * Create Category DTO
 */
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  trackerId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubCategoryDto)
  subcategories?: SubCategoryDto[];
}

/**
 * Update Category DTO
 */
export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubCategoryDto)
  subcategories?: SubCategoryDto[];
}
