import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddToCartDto, CartDto, CartItemDto, RemoveFromCartDto, UpdateCartDto } from "./dto";

@Injectable()
export class CartService { 
    constructor(private readonly prisma: PrismaService) {}

    // ADD
    async addToCart(addToCartDto: AddToCartDto, userId: number): Promise<CartItemDto> {
        try {
            const cart = await this.prisma.cart.findUnique({
                where: {
                    userId,
                },
            });

            if (!cart) {
                await this.prisma.cart.create({
                    data: {
                        userId,
                    },
                });
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
            throw new InternalServerErrorException('error adding item to cart');
        }
    }

    // UPDATE
    async updateCartItem(updateCartDto: UpdateCartDto, userId: number): Promise<CartItemDto> {
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
            if (error.code === 'P2025') {
                throw new NotFoundException('cart item not found');
            }

            throw new InternalServerErrorException('error updating cart item');
        }
    }

    // REMOVE
    async removeCartItem(removeFromCartDto: RemoveFromCartDto, userId: number): Promise<void> {
        try {
            await this.prisma.cartItem.delete({
                where: {
                    id: removeFromCartDto.productId,
                },
            });

        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException('cart item not found');
            }

            throw new InternalServerErrorException('error removing cart item');
        }
    }

    // get all
    async getCartItems(userId: number): Promise<CartDto> {
        try {
            const cart = await this.prisma.cart.findUnique({
                where: {
                    userId,
                },
                include: {
                    cartItems: true,
                },
            });

            if (!cart) {
                throw new NotFoundException('cart not found');
            }

            const cartItemsDto = cart.cartItems.map((item) => new CartItemDto(item));
            
            
            return new CartDto(cartItemsDto);

        } catch (error) {
            throw new InternalServerErrorException('error retrieving cart items');
        }
    }
}