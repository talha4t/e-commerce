import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CloudinaryService } from "src/config/cloudinary.config";
import { PrismaService } from "src/prisma/prisma.service";
import { AddCategoryDto } from "src/product/dto/add-category.dto";
import { CreateProductDto } from "src/product/dto/create-product.dto";
import { ProductQueryDto } from "src/product/dto/productquery.dto";
import { UpdateProductDto } from "src/product/dto/update-product.dto";
import { ProductService } from "src/product/product.service";

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
    it("should create a new product with image", async () => {
      const createProductDto: CreateProductDto = {
        name: "Test Product",
        description: "Test Description",
        price: 10000,
        stock: 100,
        categoryId: 1,
      };
      const mockImage: Express.Multer.File = {
        fieldname: "image",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
        size: 1024,
        destination: "/tmp",
        filename: "test.jpg",
        path: "/tmp/test.jpg",
        stream: null,
      };
      const mockProduct = {
        id: 1,
        ...createProductDto,
        imageUrl: "https://example.com/image.jpg",
      };

      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Test Category",
      });
      (cloudinaryService.uploadImage as jest.Mock).mockResolvedValue(
        "https://example.com/image.jpg"
      );
      (prismaService.product.create as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const result = await productService.createProduct(
        createProductDto,
        mockImage
      );

      expect(result).toEqual(mockProduct);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: createProductDto.categoryId },
      });
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockImage.path
      );
      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...createProductDto,
          imageUrl: "https://example.com/image.jpg",
        },
      });
    });

    it("should throw NotFoundException when category not found", async () => {
      const createProductDto: CreateProductDto = {
        name: "Test Product",
        description: "Test Description",
        price: 10.99,
        stock: 100,
        categoryId: 999,
      };

      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        productService.createProduct(createProductDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getAllProducts", () => {
    it("should retrieve products with filtering and pagination", async () => {
      const queryDto: ProductQueryDto = {
        name: "Test",
        minPrice: 5,
        maxPrice: 15,
        page: 1,
        limit: 10,
      };
      const mockProducts = [
        { id: 1, name: "Test Product 1", price: 9.99 },
        { id: 2, name: "Test Product 2", price: 14.99 },
      ];

      (prismaService.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts
      );

      const result = await productService.getAllProducts(queryDto);

      expect(result).toEqual(mockProducts);
      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: "Test", mode: "insensitive" },
            price: { gte: 5, lte: 15 },
          }),
          skip: 0,
          take: 10,
        })
      );
    });
  });

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
