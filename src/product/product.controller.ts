import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductQueryDto } from "./dto/productquery.dto";
import { AtGuard, RolesGuard } from "../common/guards";
import { Roles } from "../common/decorators";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { AddCategoryDto } from "./dto/add-category.dto";

@ApiTags('Products')
@Controller('api/v1/products')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
    ) {}

    @Post('add-category')
    @UseGuards(AtGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Add a new category' })
    async addCategory(@Body() addCategory: AddCategoryDto) {
        const newCategory = await this.productService.addCategory(addCategory);
        return {
            message: 'Category added successfully',
            data: newCategory,
        };
    }
    
    @Post('add-products')
    @UseGuards(AtGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create a new product' })
    async createProduct(@Body() createProductDto: CreateProductDto) {
        return this.productService.createProduct(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get a list of all products' })
    async getAllProducts(@Query() query: ProductQueryDto) {
        return this.productService.getAllProducts(query);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get a single product by ID' })
    async getProductById(@Param('id') id: string) {
        return this.productService.getProductById(+id);
    }

    @Patch('/:id')
    @UseGuards(AtGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an existing product' })
    async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.updateProduct(+id, updateProductDto);
    }

    @Delete('/:id')
    @UseGuards(AtGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete a product by ID' })
    async deleteProduct(@Param('id') id: string) {
        return this.productService.deleteProduct(+id);
    }

}