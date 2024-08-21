import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { WishlistService } from "./wishlist.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AtGuard, RolesGuard } from "src/common/guards";
import { CreateWishlistDto } from "./dto/create-wishlist.dto";
import { Roles } from "src/common/decorators";
import { Request } from "express";
import { MoveToCartDto } from "./dto/move-to-cart.dto";

@Roles('user')
@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('api/v1/wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) {}

    // ADD
    @Post()
    @UseGuards(AtGuard, RolesGuard)
    @ApiOperation({ summary: 'Add a product to the wishlist' })
    async createWishlist(
        @Req() req: Request,
        @Body() createWishlistDto: CreateWishlistDto
    ) {
        const userId = req.user['userId'];
        const newWishlistItem = 
            await this.wishlistService.createWishlist(userId, createWishlistDto);

        return {
            message: 'Product added to wishlist',
            data: newWishlistItem
        };
    }

    //TODO SEE WISHLIST
    @Get()
    @UseGuards(AtGuard, RolesGuard)
    @ApiOperation({ summary: 'Get all wishlist items for the user' })
    async getWishlist(@Req() req: Request) {
        const userId = req.user['userId'];

        const wishlistItems = await this.wishlistService.getWishlist(userId);
        
        return {
            message: 'Wishlist retrieved successfully',
            data: wishlistItems
        };
    }


    // Move to Cart 
    @Patch('/:id')
    @UseGuards(AtGuard, RolesGuard)
    @ApiOperation({ summary: 'Move a wishlist item to the cart' })
    async moveToCart(
        @Param('id') id: string,
        @Body() movetoCartDto: MoveToCartDto
    ) {
        const result = await this.wishlistService.moveToCart(+id, movetoCartDto);

        return {
            message: result.message,
        };
    }

    // DELETE
    @Delete('/:id')
    @UseGuards(AtGuard, RolesGuard)
    @ApiOperation({ summary: 'Remove a product from the wishlist' })
    async removeWishlist(@Param('id') id: string) {
        await this.wishlistService.removeWishlist(+id);
        return {
            message: 'Product removed from wishlist successfully',
        };
    }

    
}