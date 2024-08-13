import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductQueryDto } from "./dto/productquery.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) {}

    // create a new product
    async createProduct(createProductDto: CreateProductDto) {
        return this.prisma.product.create({
            data: createProductDto,
        });
    }

    // retrieve all products with optional filtering and pagination 
    async getAllProducts(query: ProductQueryDto) {
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

        return this.prisma.product.findMany({
            where: whereClause,
            orderBy: {
                price: sortDirection === 'asc' ? 'asc' : 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    // retrieve a single product by ID
    async getProductById(id: number) {
        const product = await this.prisma.product.findUnique({
            where: {
                id,
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    } 

    // update
    async updateProduct(id: number, updateProductDto: UpdateProductDto) {
        const product = await this.prisma.product.update({
            where: {
                id,
            },
            data: UpdateProductDto,
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    } 

    // delete 
    async deleteProduct(id: number) {
        const product = await this.prisma.product.delete({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }
}