import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CartService } from "src/cart/cart.service";
import { AddToCartDto, RemoveFromCartDto, UpdateCartDto } from "src/cart/dto";
import { PrismaService } from "src/prisma/prisma.service";

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

      expect(result).toEqual(expect.objectContaining(mockUpdatedCartItem));
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
          { id: 1, cartId: 1, productId: 1, quantity: 2 },
          { id: 2, cartId: 1, productId: 2, quantity: 1 },
        ],
      };

      (prismaService.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.getCartItems(userId);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual(
        expect.objectContaining(mockCart.cartItems[0])
      );
      expect(result.items[1]).toEqual(
        expect.objectContaining(mockCart.cartItems[1])
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
