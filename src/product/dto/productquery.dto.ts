import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString } from "class-validator";

export class ProductQueryDto {
    @ApiProperty({ description: 'Filter by product name', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Filter by product description', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Filter by product category', required: false })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({ description: 'Minimum price for filtering', required: false, type: 'number' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    minPrice?: number;

    @ApiProperty({ description: 'Sort direction for results', enum: ['ASC', 'DESC'], default: 'ASC', required: false })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortDirection?: 'asc' | 'desc';

    @ApiProperty({ description: 'Maximum price for filtering', required: false, type: 'number' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    maxPrice?: number;

    @ApiProperty({ description: 'Page number for pagination', default: 1, required: false, type: 'number' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    page?: number;

    @ApiProperty({ description: 'Number of items per page', default: 10, required: false, type: 'number' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    limit?: number;
}