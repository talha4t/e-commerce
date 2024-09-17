import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  AddToCartDto,
  CartDto,
  CartItemDto,
  RemoveFromCartDto,
  UpdateCartDto,
} from "./dto";

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // ADD
  async addToCart(
    addToCartDto: AddToCartDto,
    userId: number
  ): Promise<CartItemDto> {
    console.log(userId);
    try {
      // Ensure the cart exists
      let cart = await this.prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId },
        });
      }

      // Ensure the product exists
      const product = await this.prisma.product.findUnique({
        where: { id: addToCartDto.productId },
      });

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      if (product.stock <= 0) {
        throw new BadRequestException("Product is out of stock");
      }

      if (addToCartDto.quantity > product.stock) {
        throw new BadRequestException(
          "Requested quantity exceeds available stock"
        );
      }

      const cartItem = await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: addToCartDto.productId,
          quantity: addToCartDto.quantity,
        },
      });

      return new CartItemDto(cartItem);
    } catch (error) {
      console.log(error);

      throw new NotFoundException("Error adding item to cart");
    }
  }

  // UPDATE
  async updateCartItem(
    updateCartDto: UpdateCartDto,
    userId: number
  ): Promise<CartItemDto> {
    try {
      const updateDCartItem = await this.prisma.cartItem.update({
        where: {
          id: updateCartDto.productId,
        },
        data: {
          quantity: updateCartDto.quantity,
        },
      });

      return new CartItemDto(updateDCartItem);
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException("cart item not found");
      }

      throw new InternalServerErrorException("error updating cart item");
    }
  }

  // REMOVE
  async removeCartItem(
    removeFromCartDto: RemoveFromCartDto,
    userId: number
  ): Promise<void> {
    try {
      await this.prisma.cartItem.delete({
        where: {
          id: removeFromCartDto.productId,
        },
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException("cart item not found");
      }

      throw new InternalServerErrorException("error removing cart item");
    }
  }

  // get all
  async getCartItems(userId: number): Promise<CartDto> {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: {
          userId,
        },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        throw new NotFoundException("cart not found");
      }

      // Calculate the total price of the items in the cart
      const totalPrice = cart.cartItems.reduce((total, cartItem) => {
        return total + cartItem.quantity * cartItem.product.price;
      }, 0);

      const cartItemsDto = cart.cartItems.map((item) => new CartItemDto(item));

      return new CartDto(cartItemsDto, totalPrice);
    } catch (error) {
      console.log(error);

      throw new NotFoundException("error retrieving cart items");
    }
  }
}
