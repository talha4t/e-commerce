import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive } from "class-validator";

export class AddToCartDto {
    @ApiProperty({
        description: 'ID of the product to add to the cart',
        example: 1
    })
    @IsInt()
    @IsPositive()
    productId: number;

    @ApiProperty({
        description: 'quantity of the product to add to the cart',
        example: 2
    })
    @IsInt()
    @IsPositive()
    quantity: number;
}