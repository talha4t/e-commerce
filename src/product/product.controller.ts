import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductQueryDto } from "./dto/productquery.dto";
import { AtGuard, RolesGuard } from "src/common/guards";
import { Roles } from "src/common/decorators";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateProductDto } from "./dto/create-product.dto";

@Controller('products')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
    ) {}
    
    @Post()
    @UseGuards(AtGuard, RolesGuard)
    @Roles('admin')
    async createProduct(@Body() createProductDto: CreateProductDto) {
        return this.productService.createProduct(createProductDto);
    }

    @Get()
    async getAllProducts(@Query() query: ProductQueryDto) {
        return this.productService.getAllProducts(query);
    }

    @Get(':id')
    async getProductById(@Param('id') id: string) {
        return this.productService.getProductById(+id);
    }

    @Patch(':id')
    @UseGuards(AtGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.updateProduct(+id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(AtGuard, RolesGuard)
    @Roles('admin')
    async deleteProduct(@Param('id') id: string) {
        return this.productService.deleteProduct(+id);
    }

}