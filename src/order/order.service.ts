import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class OrderService {
    constructor(private readonly prisma: PrismaService) {}

    // ADD
    async createOrder(createOrderDto: CreateOrderDto, userId: number): Promise<number> {
        try {
            const cart = await this.prisma.cart.findUnique({
                where: { userId },
                include: {
                    cartItems: {
                        include: {
                            product: true, // ex
                        },
                    },
                },
            });

            if (!cart || cart.cartItems.length === 0) {
                throw new BadRequestException('cart is empty');
            }

            const totalPrice = cart.cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

            const order = await this.prisma.order.create({
                data: {
                    userId,
                    totalPrice,
                    status: "pending",
                    address: createOrderDto.address,
                    contactNumber: createOrderDto.contactNumber,
                    orderItems: {
                        create: cart.cartItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                            productDescription: item.product.description
                        }))
                    }
                }
            });

            // deduct stock for each product
            await Promise.all(
                cart.cartItems.map(item => 
                    this.prisma.product.update({
                        where: {
                            id: item.productId,
                        },
                        data: {
                            stock: {
                                decrement: item.quantity
                            }
                        }
                    })
                )
            );

            // clear users cart after order has been placed
            await this.prisma.cart.delete({
                where: {
                    userId,
                }
            });

            return order.id;

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new BadRequestException('order creation failed due to invalid data');
            }

            throw new InternalServerErrorException('error creating order');
        }
    }

    // UPDATE status
    async updateOrder(orderId: number, status: string): Promise<void> {
        try {
            const order = await this.prisma.order.findUnique({
                where: {
                    id: orderId,
                }
            });

            if (!order) {
                throw new NotFoundException('order not found');
            }

            await this.prisma.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status
                }
            });
            
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new BadRequestException('order update failed due to invalid data');
            }

            throw new InternalServerErrorException('error updating order');

        }
    }

    // get order by ID
    async getOrderById(orderId: number): Promise<any> {
        try {
            const order = await this.prisma.order.findUnique({
                where: {
                    id: orderId,
                },
                include: {
                    orderItems: {
                        include: {
                            product: true,
                        }
                    }
                }
            });

            if (!order) {
                throw new NotFoundException('order not found');
            }

            return order;
        } catch (error) {
            throw new InternalServerErrorException('error retrieving order by id');
        }
    }

    // history
    async getOrderHistory(userId: number): Promise<any> {
        try {
            const orders = await this.prisma.order.findMany({
                where: {
                    userId
                },
                include: {
                    orderItems: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            if (!orders.length) {
                throw new NotFoundException('no orders found for this user');
            }

            return orders;
        } catch (error) {
            throw new InternalServerErrorException('error retrieving order history');
        }
    }
}