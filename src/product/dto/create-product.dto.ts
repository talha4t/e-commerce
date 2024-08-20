import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        description: 'Product name',
        example: 'Sneakers',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Product description',
        example: 'Comfortable and versatile footwear designed for casual wear or sports activities.',
    })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Product price',
        example: 10000,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    price: number;

    @ApiProperty({
        description: 'Product quantity available in stock',
        example: 50,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    stock: number;

    @ApiProperty({
        description: 'The ID of the category the product belongs to',
        example: 1,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    categoryId: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}