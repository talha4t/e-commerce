import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsPositive, IsInt } from "class-validator";

export class MoveToCartDto {
    @ApiProperty(
        { 
            example: 1, 
            description: 'ID of the product to move to the cart', 
            required: true 
        }
    )
    @IsPositive()
    @IsInt()
    productId: number;
}
