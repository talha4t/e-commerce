import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class RemoveFromCartDto {
    @ApiProperty({
        description: 'ID of the product to remove',
        example: 1
    })
    @IsInt()
    @Type(() => Number)
    productId: number;
}