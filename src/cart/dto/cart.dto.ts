import { ApiProperty } from "@nestjs/swagger";
import { CartItemDto } from "./cart-item.dto";

export class CartDto {
  @ApiProperty({
    description: "List of items in the cart",
    type: [CartItemDto],
  })
  items: CartItemDto[];

  @ApiProperty({
    description: "Total price of all items in the cart",
    example: 0,
  })
  totalPrice: number;

  constructor(cartItems: CartItemDto[], totalPrice: number) {
    this.items = cartItems;
    this.totalPrice = totalPrice;
  }
}
