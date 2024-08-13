import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from '@prisma/client';

export class CartItemDto {
  @ApiProperty({
    description: 'Unique identifier for the cart item',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Unique identifier for the cart associated with this item',
    example: 1,
  })
  cartId: number;

  @ApiProperty({
    description: 'Unique identifier for the product in the cart',
    example: 101,
  })
  productId: number;

  @ApiProperty({
    description: 'Quantity of the product in the cart',
    example: 2,
  })
  quantity: number;

  constructor(cartItem: CartItem) {
    this.id = cartItem.id;
    this.cartId = cartItem.cartId;
    this.productId = cartItem.productId;
    this.quantity = cartItem.quantity;
  }
}
