import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddCategoryDto {
    @ApiProperty({ description: 'Name of the category', example: 'Chairs' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Description of the category', example: 'Chairs & Table', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
