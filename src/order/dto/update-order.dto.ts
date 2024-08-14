import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateOrderDto {
    @ApiProperty({ 
        description: 'ID of the order to update', 
        example: 1 
    })
    @IsNotEmpty()
    @IsNumber()
    orderId: number;

    @ApiProperty({ 
        description: 'updated status of the order', 
        example: 'completed' 
    })
    @IsNotEmpty()
    @IsString()
    status: string;
}
