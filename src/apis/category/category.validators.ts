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

/**
 * Get All Categories Query DTO
 */
export class GetAllCategoriesQueryDto {
  @IsString()
  @IsOptional()
  trackerId?: string;
}

/**
 * Category Response DTO
 */
export class CategoryResponseDto {
  id: string;
  name: string;
  subcategories: SubCategoryDto[];
  trackerId: string;

  constructor(data: any) {
    this.id = data._id || data.id;
    this.name = data.name;
    this.subcategories = data.subcategories || [];
    this.trackerId = data.trackerId;
  }
}
