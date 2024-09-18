import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  // ADD
  async createOrder(
    createOrderDto: CreateOrderDto,
    userId: number
  ): Promise<number> {
    try {
      if (!userId) {
        throw new BadRequestException("userId is required");
      }

      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.cartItems.length === 0) {
        throw new BadRequestException("cart is empty");
      }

      const totalPrice = cart.cartItems.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      );

      const order = await this.prisma.order.create({
        data: {
          userId,
          totalPrice,
          status: "pending",
          address: createOrderDto.address,
          contactNumber: createOrderDto.contactNumber,
          orderItems: {
            create: cart.cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              productDescription: item.product.description,
              // Commented out image uploader
              // productImage: item.product.image,
            })),
          },
        },
      });

      // deduct stock for each product
      await Promise.all(
        cart.cartItems.map((item) =>
          this.prisma.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        )
      );

      // clear users cart after order has been placed
      // First delete all cart items
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      // Then delete the cart
      await this.prisma.cart.delete({
        where: {
          id: cart.id,
        },
      });

      return order.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          "order creation failed due to invalid data"
        );
      }
      throw new BadRequestException("error creating order");
    }
  }

  // UPDATE status
  async updateOrder(orderId: number, status: string): Promise<void> {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

      if (!order) {
        throw new NotFoundException("order not found");
      }

      await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          "order update failed due to invalid data"
        );
      }

      throw new NotFoundException("error updating order");
    }
  }

  // history
  async getOrderHistory(userId: number): Promise<any> {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          userId,
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!orders.length || orders.length === 0) {
        throw new NotFoundException("no orders found for this user");
      }

      return orders;
    } catch (error) {
      throw new NotFoundException("error retrieving order history");
    }
  }

  // get order by ID
  async getOrderById(orderId: string): Promise<any> {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          id: Number(orderId),
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException("order not found");
      }

      return order;
    } catch (error) {
      throw new NotFoundException("error retrieving order by id");
    }
  }
}
