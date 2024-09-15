import { Test, TestingModule } from "@nestjs/testing";
import { OrderService } from "src/order/order.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOrderDto } from "src/order/dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("OrderService Integration Tests", () => {
  let orderService: OrderService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            product: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe("createOrder", () => {
    it("should create an order successfully", async () => {
      const userId = 1;
      const createOrderDto: CreateOrderDto = {
        productId: [1, 2],
        totalPrice: 100,
        address: "Ishan Gopalpur, Faridpur Sadar, Faridpur",
        contactNumber: "+8801516516405",
      };

      const mockProducts = [
        { id: 1, price: 50, stock: 10, description: "Product 1" },
        { id: 2, price: 50, stock: 5, description: "Product 2" },
      ];

      const mockOrder = {
        id: 1,
        userId: 1,
        totalPrice: 100,
        status: "pending",
        address: "Ishan Gopalpur, Faridpur Sadar, Faridpur",
        contactNumber: "+8801516516405",
      };

      prismaService.product.findMany = jest
        .fn()
        .mockResolvedValue(mockProducts);
      prismaService.order.create = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.createOrder(createOrderDto, userId);

      expect(result).toBe(1);
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: createOrderDto.productId } },
      });
      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          totalPrice: createOrderDto.totalPrice,
          status: "pending",
          address: createOrderDto.address,
          contactNumber: createOrderDto.contactNumber,
          orderItems: {
            create: expect.arrayContaining([
              expect.objectContaining({
                productId: 1,
                quantity: 1,
                price: 50,
                productDescription: "Product 1",
              }),
              expect.objectContaining({
                productId: 2,
                quantity: 1,
                price: 50,
                productDescription: "Product 2",
              }),
            ]),
          },
        }),
      });
      expect(prismaService.product.update).toHaveBeenCalledTimes(2);
    });

    it("should throw BadRequestException if products are not found", async () => {
      const userId = 1;
      const createOrderDto: CreateOrderDto = {
        productId: [1, 2],
        totalPrice: 100,
        address: "Ishan Gopalpur, Faridpur Sadar, Faridpur",
        contactNumber: "+8801516516405",
      };

      prismaService.product.findMany = jest.fn().mockResolvedValue([]);

      await expect(
        orderService.createOrder(createOrderDto, userId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateOrder", () => {
    it("should update order status successfully", async () => {
      const orderId = 1;
      const status = "completed";

      prismaService.order.findUnique = jest
        .fn()
        .mockResolvedValue({ id: orderId });

      await orderService.updateOrder(orderId, status);

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
      });
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status },
      });
    });

    it("should throw NotFoundException if order not found", async () => {
      const orderId = 999;
      const status = "completed";

      prismaService.order.findUnique = jest.fn().mockResolvedValue(null);

      await expect(orderService.updateOrder(orderId, status)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("getOrderHistory", () => {
    it("should return order history for a user", async () => {
      const userId = 1;
      const mockOrders = [
        { id: 1, userId: 1, totalPrice: 100, status: "completed" },
        { id: 2, userId: 1, totalPrice: 150, status: "pending" },
      ];

      prismaService.order.findMany = jest.fn().mockResolvedValue(mockOrders);

      const result = await orderService.getOrderHistory(userId);

      expect(result).toEqual(mockOrders);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    it("should throw NotFoundException if no orders found", async () => {
      const userId = 1;

      prismaService.order.findMany = jest.fn().mockResolvedValue([]);

      await expect(orderService.getOrderHistory(userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("getOrderById", () => {
    it("should return an order by id", async () => {
      const orderId = "1";
      const mockOrder = {
        id: 1,
        userId: 1,
        totalPrice: 100,
        status: "completed",
        address: "Ishan Gopalpur, Faridpur Sadar, Faridpur",
        contactNumber: "+8801516516405",
        orderItems: [],
      };

      prismaService.order.findUnique = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(orderId);

      expect(result).toEqual(mockOrder);
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: Number(orderId) },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    it("should throw NotFoundException if order not found", async () => {
      const orderId = "999";

      prismaService.order.findUnique = jest.fn().mockResolvedValue(null);

      await expect(orderService.getOrderById(orderId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
