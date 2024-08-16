import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddCategoryDto {
    @ApiProperty({ description: 'Name of the category', example: 'Fashion' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Description of the category', example: ' This category is all about style, trends, and personal expression through apparel and accessories.', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
