import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateWishlistDto } from "./dto/create-wishlist.dto";
import { MoveToCartDto } from "./dto/move-to-cart.dto";

@Injectable()
export class WishlistService { 
    constructor(private readonly prisma: PrismaService) {}

    // ADD
    async createWishlist(userId: number, createWishlistDto: CreateWishlistDto) {
        const { productId } = createWishlistDto;
        
        
        try {
            const existingWishlistItem = await this.prisma.wishlist.findUnique({
                where: {
                    userId_productId: {
                        userId: Number(userId),
                        productId: productId
                    }
                },
            });

            if (existingWishlistItem) {
                throw new Error('Wishlist item already exists');
            }

            return await this.prisma.wishlist.create({
                data: {
                    userId: Number(userId),
                    productId: productId
                },
            });

        } catch (error) {
            console.error(error);

            throw new InternalServerErrorException('Failed to add product to wishlist');
        }
    }

    //TODO SEE WISHLIST
    async getWishlist(userId: number) {
        try {
            const wishlistItems = await this.prisma.wishlist.findMany({
                where: { userId },
                include: {
                    product: true,
                }
            });

            if (wishlistItems.length === 0) {
                return {
                    message: 'No item found in Wishlist',
                    data: []
                }
            }

            return {
                message: 'Wishlist retrieved successfully',
                data: wishlistItems 
            }

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to retrieve wishlist');
        }
    }

    // Move to Cart 
    async moveToCart(id: number, movetoCartDto: MoveToCartDto) {
        const { productId } = movetoCartDto;

        try {
            const wishlistItem = await this.prisma.wishlist.findUnique({
                where: { id },
            });

            if (!wishlistItem) {
                throw new NotFoundException(`Wishlist item with ID ${id} not found`);
            }

            // Ensure the cart exists
            let cart = await this.prisma.cart.findUnique({
                where: { userId: wishlistItem.userId },
            });

            if (!cart) {
                cart = await this.prisma.cart.create({
                    data: { userId: wishlistItem.userId },
                });
            }

            // Ensure the product exists
            const product = await this.prisma.product.findUnique({
                where: { id: productId ?? wishlistItem.productId },
            });

            if (!product) {
                throw new NotFoundException('Product not found');
            }

            if (product.stock <= 0) {
                throw new BadRequestException('Product is out of stock');
            }

            // Add the item to the cart
            const cartItem = await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId ?? wishlistItem.productId,
                    quantity: 1,
                },
            });

            // Remove the item from the wishlist
            await this.prisma.wishlist.delete({
                where: { id },
            });

            return {
                message: 'Product added to cart and removed from wishlist',
                data: cartItem,
            };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to move product to cart');
        }
    }

    // DELETE
    async removeWishlist(id: number) {
        try {
            const wishlistItem = await this.prisma.wishlist.findUnique({
                where: { id },
            });

            if (!wishlistItem) {
                throw new NotFoundException(`Wishlist item with ID ${id} not found`);
            }

            await this.prisma.wishlist.delete({
                where: { id }
            });

            return {
                message: 'Product removed from wishlist successfully',
            }
        } catch (error) {
            console.error(error);

            throw new InternalServerErrorException('Failed to remove product from wishlist');
        }
    }

    
}