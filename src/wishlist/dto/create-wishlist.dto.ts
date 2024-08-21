import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class CreateWishlistDto {

    @ApiProperty({
        description: 'The ID of the product to be added to the wishlist',
        example: 101,
    })
    @IsNotEmpty()
    @IsInt()
    productId: number;
}