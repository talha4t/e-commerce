import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateOrderDto {
  @ApiProperty({
    description: "list of product IDs in the order",
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @IsNumber(
    {},
    {
      each: true,
    }
  )
  productId: number[];

  @ApiProperty({
    description: "shipping address for the order",
    example: "Ishan Gopalpur, Faridpur Sadar, Faridpur",
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: "contact number for the order",
    example: "+8801516516405",
  })
  @IsNotEmpty()
  @IsString()
  contactNumber: string;
}
