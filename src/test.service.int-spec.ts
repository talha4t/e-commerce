// common
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

// auth
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "src/auth/auth.service";
import * as argon from "argon2";
import { AppModule } from "src/app.module";
import { AuthDto, TokensDto } from "src/auth/dto";
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";

// product
import { CloudinaryService } from "src/config/cloudinary.config";
import { AddCategoryDto } from "src/product/dto/add-category.dto";
import { CreateProductDto } from "src/product/dto/create-product.dto";
import { ProductQueryDto } from "src/product/dto/productquery.dto";
import { UpdateProductDto } from "src/product/dto/update-product.dto";
import { ProductService } from "src/product/product.service";

// cart
import { CartService } from "src/cart/cart.service";
import { AddToCartDto, RemoveFromCartDto, UpdateCartDto } from "src/cart/dto";

// order
import { OrderService } from "src/order/order.service";
import { CreateOrderDto } from "src/order/dto";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe("register", () => {
    it("should register a new user and returns token", async () => {
      const dto: AuthDto = {
        email: "testpick@aaa.com",
        password: "56",
        name: "testUser",
        role: "admin",
      };
      const hashedPassword = await argon.hash(dto.password);

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue({
        id: 1,
        ...dto,
        password: hashedPassword,
      });
      jwtService.signAsync = jest.fn().mockResolvedValue("accessToken");

      const tokens = await service.register(dto);

      expect(tokens).toHaveProperty("accessToken");
      expect(tokens).toHaveProperty("refreshToken");
    });

    it("should throw conflictException if user already exists", async () => {
      const dto: AuthDto = {
        email: "testpick@aaa.com",
        password: "56",
        name: "testUser",
        role: "admin",
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should login a user and returns tokens", async () => {
      const dto: AuthDto = {
        email: "testpick@aaa.com",
        password: "56",
      };
      const hashedPassword = await argon.hash(dto.password);

      const user = {
        id: 1,
        email: dto.email,
        password: hashedPassword,
        role: "admin",
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(user);
      jest.spyOn(argon, "verify").mockResolvedValue(true);
      jwtService.signAsync = jest.fn().mockResolvedValue("accessToken");
      service["hashedPassword"] = jest.fn().mockResolvedValue(undefined);

      const tokens = await service.login(dto);

      expect(tokens).toHaveProperty("accessToken");
      expect(tokens).toHaveProperty("refreshToken");
    });

    it("should throw ForbiddenException if credentials are invalid", async () => {
      const dto: AuthDto = {
        email: "testpick@aaa.com",
        password: "58",
      };
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: dto.email,
        password: await argon.hash("password"),
        role: "admin",
      });
      jest.spyOn(argon, "verify").mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("logout", () => {
    it("should logout a user by clearing the refresh token", async () => {
      prisma.user.updateMany = jest.fn().mockResolvedValue({
        count: 1,
      });

      await expect(service.logout(1)).resolves.not.toThrow();
    });

    it("should throw an error if the logout operation fails", async () => {
      prisma.user.updateMany = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      await expect(service.logout(1)).rejects.toThrow("Logout failed");
    });
  });

  describe("forgetPassword", () => {
    it("should generate a reset token and update user", async () => {
      const email = "testpick@aaa.com";
      const user = { id: 1, email };
      const resetToken = "resetToken";

      prisma.user.findUnique = jest.fn().mockResolvedValue(user);
      service["generateResetToken"] = jest.fn().mockReturnValue(resetToken);
      jest.spyOn(argon, "hash").mockResolvedValue("hashedResetToken");
      prisma.user.update = jest.fn().mockResolvedValue({ id: 1 });

      const result = await service.forgetPassword(email);

      expect(result.resetToken).toEqual(resetToken);
    });

    it("should throw unauthorizedException if user is not found", async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.forgetPassword("nonexist@a.com")).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("resetPassword", () => {
    it("should reset the password if the reset token is valid", async () => {
      const newPassword = "newPassword";
      const resetToken = "validResetToken";
      const hashedPassword = await argon.hash(newPassword);

      prisma.user.findFirst = jest
        .fn()
        .mockResolvedValue({ id: 1, hashedRT: await argon.hash(resetToken) });
      jest.spyOn(argon, "verify").mockResolvedValue(true);
      prisma.user.update = jest.fn().mockResolvedValue({ id: 1 });

      const result = await service.resetPassword(hashedPassword, resetToken);

      expect(result.message).toEqual("Password successfully reset");
    });

    it("should throw UnauthorizedException if the reset token is invalid", async () => {
      const newPassword = "newPassword";
      const resetToken = "invalidResetToken";

      prisma.user.findFirst = jest.fn().mockResolvedValue({
        id: 1,
        hashedRT: await argon.hash("validRestToken"),
      });
      jest.spyOn(argon, "verify").mockResolvedValue(false);

      await expect(
        service.resetPassword(newPassword, resetToken)
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

// product
describe("Product Service Integration Test", () => {
  let productService: ProductService;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            product: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  describe("addCategory", () => {
    it("should add a new category", async () => {
      const addCategoryDto: AddCategoryDto = {
        name: "Test Category",
        description: "Test Description",
      };
      const mockCategory = { id: 1, ...addCategoryDto };

      (prismaService.category.create as jest.Mock).mockResolvedValue(
        mockCategory
      );

      const result = await productService.addCategory(addCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: addCategoryDto,
      });
    });

    it("should throw InternalServerErrorException on database error", async () => {
      const addCategoryDto: AddCategoryDto = {
        name: "Test Category",
        description: "Test Description",
      };

      (prismaService.category.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(productService.addCategory(addCategoryDto)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe("createProduct", () => {
    it("should create a new product without image", async () => {
      const createProductDto: CreateProductDto = {
        name: "Test Product",
        description: "Test Description",
        price: 10000,
        stock: 100,
        categoryId: 1,
      };
      const mockProduct = {
        id: 1,
        ...createProductDto,
      };

      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Test Category",
      });
      (prismaService.product.create as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const result = await productService.createProduct(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: createProductDto.categoryId },
      });
      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: createProductDto,
      });
    });

    it("should throw NotFoundException when category not found", async () => {
      const createProductDto: CreateProductDto = {
        name: "Test Product",
        description: "Test Description",
        price: 1099,
        stock: 100,
        categoryId: 999,
      };

      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        productService.createProduct(createProductDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  // describe("getAllProducts", () => {
  //   it("should retrieve products with filtering and pagination", async () => {
  //     const queryDto: ProductQueryDto = {
  //       name: "Test",
  //       minPrice: 5,
  //       maxPrice: 15,
  //       sortDirection: "asc",
  //     };
  //     const mockProducts = [
  //       { id: 1, name: "Test Product 1", price: 90 },
  //       { id: 2, name: "Test Product 2", price: 19 },
  //     ];

  //     (prismaService.product.findMany as jest.Mock).mockResolvedValue(
  //       mockProducts
  //     );

  //     const result = await productService.getAllProducts(queryDto);

  //     expect(result).toEqual(mockProducts);
  //     expect(jest.fn(prismaService.product.findMany)).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         where: expect.objectContaining({
  //           name: { contains: "Test", mode: "insensitive" },
  //           price: { gte: 5, lte: 15 },
  //         }),
  //         orderBy: {
  //           categoryId: "asc",
  //         },
  //       })
  //     );
  //   });
  // });

  describe("getProductById", () => {
    it("should retrieve a product by id", async () => {
      const productId = 1;
      const mockProduct = { id: productId, name: "Test Product", price: 999 };

      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const result = await productService.getProductById(productId);

      expect(result).toEqual(mockProduct);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it("should throw NotFoundException when product not found", async () => {
      const productId = 999;

      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(productService.getProductById(productId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("updateProduct", () => {
    it("should update a product", async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = {
        name: "Updated Product",
        price: 1999,
      };
      const mockUpdatedProduct = { id: productId, ...updateProductDto };

      (prismaService.product.update as jest.Mock).mockResolvedValue(
        mockUpdatedProduct
      );

      const result = await productService.updateProduct(
        productId,
        updateProductDto
      );

      expect(result).toEqual(mockUpdatedProduct);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateProductDto,
      });
    });

    it("should throw NotFoundException when product not found", async () => {
      const productId = 999;
      const updateProductDto: UpdateProductDto = { name: "Updated Product" };

      (prismaService.product.update as jest.Mock).mockRejectedValue(
        new Error("Record not found")
      );

      await expect(
        productService.updateProduct(productId, updateProductDto)
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product", async () => {
      const productId = 1;
      const mockDeletedProduct = { id: productId, name: "Deleted Product" };

      (prismaService.product.delete as jest.Mock).mockResolvedValue(
        mockDeletedProduct
      );

      const result = await productService.deleteProduct(productId);

      expect(result).toEqual(mockDeletedProduct);
      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it("should throw NotFoundException when product not found", async () => {
      const productId = 999;

      (prismaService.product.delete as jest.Mock).mockRejectedValue(
        new Error("Record not found")
      );

      await expect(productService.deleteProduct(productId)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});

// cart
describe("cartService", () => {
  let cartService: CartService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: {
            cart: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findFirst: jest.fn(),
            },
            product: {
              findUnique: jest.fn(),
            },
            cartItem: {
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe("addToCart", () => {
    it("should add an item to the cart", async () => {
      const userId = 1;
      const addToCartDto: AddToCartDto = { productId: 1, quantity: 2 };
      const mockCart = { id: 1, userId };
      const mockProduct = { id: 1, name: "Test Product", stock: 10 };
      const mockCartItem = { id: 1, cartId: 1, productId: 1, quantity: 2 };

      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct
      );
      (prismaService.cartItem.create as jest.Mock).mockResolvedValue(
        mockCartItem
      );

      const result = await cartService.addToCart(addToCartDto, userId);

      expect(result).toEqual(expect.objectContaining(mockCartItem));
    });

    it("should throw NotFoundException when product does not exist", async () => {
      const userId = 1;
      const addToCartDto: AddToCartDto = { productId: 1, quantity: 2 };

      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        userId,
      });
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(cartService.addToCart(addToCartDto, userId)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw BadRequestException when product is out of stock", async () => {
      const userId = 1;
      const addToCartDto: AddToCartDto = { productId: 1, quantity: 2 };

      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        userId,
      });
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        stock: 0,
      });

      await expect(cartService.addToCart(addToCartDto, userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("updateCartItem", () => {
    it("should update a cart item", async () => {
      const userId = 1;
      const updateCartDto: UpdateCartDto = { productId: 1, quantity: 3 };
      const mockUpdatedCartItem = {
        id: 1,
        cartId: 1,
        productId: 1,
        quantity: 3,
      };

      (prismaService.cartItem.update as jest.Mock).mockResolvedValue(
        mockUpdatedCartItem
      );

      const result = await cartService.updateCartItem(updateCartDto, userId);

      // expect(result).toEqual(expect.objectContaining(mockUpdatedCartItem));
    });

    it("should throw NotFoundException when cart item does not exist", async () => {
      const userId = 1;
      const updateCartDto: UpdateCartDto = { productId: 1, quantity: 3 };

      (prismaService.cartItem.update as jest.Mock).mockRejectedValue({
        code: "P2025",
      });

      await expect(
        cartService.updateCartItem(updateCartDto, userId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeCartItem", () => {
    it("should remove a cart item", async () => {
      const userId = 1;
      const removeFromCartDto: RemoveFromCartDto = { productId: 1 };

      (prismaService.cartItem.delete as jest.Mock).mockResolvedValue({});

      await expect(
        cartService.removeCartItem(removeFromCartDto, userId)
      ).resolves.not.toThrow();
    });

    it("should throw NotFoundException when cart item does not exist", async () => {
      const userId = 1;
      const removeFromCartDto: RemoveFromCartDto = { productId: 1 };

      (prismaService.cartItem.delete as jest.Mock).mockRejectedValue({
        code: "P2025",
      });

      await expect(
        cartService.removeCartItem(removeFromCartDto, userId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getCartItems", () => {
    it("should return cart items for a user", async () => {
      const userId = 1;
      const mockCart = {
        id: 1,
        userId,
        cartItems: [
          {
            id: 1,
            cartId: 1,
            productId: 1,
            quantity: 2,
            product: { id: 1, price: 10 },
          },
          {
            id: 2,
            cartId: 1,
            productId: 2,
            quantity: 1,
            product: { id: 2, price: 20 },
          },
        ],
      };

      (prismaService.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.getCartItems(userId);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual(
        expect.objectContaining({
          cartId: mockCart.cartItems[0].cartId,
          productId: mockCart.cartItems[0].productId,
          quantity: mockCart.cartItems[0].quantity,
        })
      );
    });

    it("should throw NotFoundException when cart does not exist", async () => {
      const userId = 1;

      (prismaService.cart.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(cartService.getCartItems(userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});

// order
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

      // expect(result).toEqual(mockOrders);
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

      // expect(result).toEqual(mockOrder);
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
