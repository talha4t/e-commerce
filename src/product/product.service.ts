import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductQueryDto } from "./dto/productquery.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AddCategoryDto } from "./dto/add-category.dto";
import { CloudinaryService } from "src/config/cloudinary.config";
import * as fs from "fs";
@Injectable()
export class ProductService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async addCategory(addCategoryDto: AddCategoryDto) {
        const { name, description } = addCategoryDto;
        
        try {
            return await this.prisma.category.create({
                data: {
                    name,
                    description,
                },
            });
        } catch (error) {
            console.error(error);
            
            throw new InternalServerErrorException('Failed to add category');
        }
    }

    async createProduct(
        createProductDto: CreateProductDto, 
        image?: Express.Multer.File
    ) {
        try {
            const category = await this.prisma.category.findUnique({
                where: { id: createProductDto.categoryId },
            });
            
            if (!category) {
                throw new NotFoundException(`Category with ID ${createProductDto.categoryId} not found`);
            }
            
            let imageUrl: string | null = null;

            if (image) {
                
                const localFilePath = image.path;
                if (!fs.existsSync(localFilePath)) {
                    throw new InternalServerErrorException('file not found in local path');
                }
                
                const uploadResult = await this.cloudinaryService.uploadImage(image.path);

                imageUrl = uploadResult;
            }

            return await this.prisma.product.create({
                data: {
                    ...createProductDto,
                    imageUrl,
                },
            });

        } catch (error) {
            console.log(error);

            throw new InternalServerErrorException('Failed to create product');
        }
    }
    
    // retrieve all products with optional filtering and pagination 
    async getAllProducts(query: ProductQueryDto) {
        try {
            const { name, description, category, minPrice, maxPrice, sortDirection, page = 1, limit = 10 } = query;

            const whereClause: any = {};

            const filters = {
                name: name ? { contains: name, mode: 'insensitive' } : undefined,
                description: description ? { contains: description, mode: 'insensitive' } : undefined,
                category: category ? { name: { contains: category, mode: 'insensitive' } } : undefined,
                price: {
                    ...(minPrice !== undefined && { gte: minPrice }),
                    ...(maxPrice !== undefined && { lte: maxPrice }),
                },
            };

            // filter out undefined condition
            Object.entries(filters).forEach(([key, value]) => {
                if (value && Object.keys(value).length > 0) {
                    whereClause[key] = value;
                }
            });

            return await this.prisma.product.findMany({
                where: whereClause,
                orderBy: {
                    price: sortDirection === 'asc' ? 'asc' : 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve products'); // Comment: Added error handling
        }
    }

    // retrieve a single product by ID
    async getProductById(id: number) {
        try {
            const product = await this.prisma.product.findUnique({
                where: {
                    id,
                },
            });

            if (!product) {
                throw new NotFoundException(`Product with ID ${id} not found`);
            }

            return product;
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve product'); // Comment: Added error handling
        }
    } 

    // update
    async updateProduct(id: number, updateProductDto: UpdateProductDto) {
        try {
            const product = await this.prisma.product.update({
                where: {
                    id,
                },
                data: updateProductDto, // Comment: Fixed UpdateProductDto usage
            });

            if (!product) {
                throw new NotFoundException(`Product with ID ${id} not found`);
            }

            return product;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update product'); // Comment: Added error handling
        }
    } 

    // delete 
    async deleteProduct(id: number) {
        try {
            const product = await this.prisma.product.delete({
                where: { id },
            });

            if (!product) {
                throw new NotFoundException(`Product with ID ${id} not found`);
            }

            return product;
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete product'); // Comment: Added error handling
        }
    }
}