import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsPositive } from "class-validator";

export class UpdateCartDto {
    @ApiProperty({
        description: 'ID of the product to update',
        example: 1
    })
    @IsInt()
    @Type(() => Number)
    productId: number;

    @ApiProperty({ description: 'New quantity of the product', example: 3 })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    quantity: number;
}