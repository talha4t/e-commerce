import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        description: 'Product name',
        example: 'Product 1',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Product description',
        example: 'Product 1 description',
    })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Product price',
        example: 10000,
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({
        description: 'Product quantity',
    })
    @IsNotEmpty()
    @IsInt()
    stock: number;

    @ApiProperty({
        description: 'The ID of the category the product belongs to'
    })
    @IsNotEmpty()
    @IsInt()
    categoryId: number;
}