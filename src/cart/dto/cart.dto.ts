import { ApiProperty } from '@nestjs/swagger';
import { CartItemDto } from './cart-item.dto';

export class CartDto {
  @ApiProperty({
    description: 'List of items in the cart',
    type: [CartItemDto],
  })
  items: CartItemDto[];

  constructor(cartItems: CartItemDto[]) {
    this.items = cartItems;
  }
}
