import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CartService } from "./cart.service";
import { AtGuard, RolesGuard } from "../common/guards";
import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { GetCurrentUser, Roles } from "../common/decorators";
import { User } from "@prisma/client";
import { CartDto, CartItemDto, UpdateCartDto, RemoveFromCartDto, AddToCartDto } from "./dto";

@ApiTags('Carts')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('api/v1/cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    // ADD
    @ApiOperation(
        {
            summary: 'Add a product to the cart'
        }
    )
    @UseGuards(AtGuard, RolesGuard)
    @Roles('user')
    @Post('add')
    async addToCart (@Body() addToCartDto: AddToCartDto, @GetCurrentUser('userId') userId: number): Promise<CartItemDto> {

        return this.cartService.addToCart(addToCartDto, userId);
    }

    // UPDATE
    @ApiOperation(
        { 
            summary: 'update a cart item' 
        }
    )
    @Roles('user')
    @Patch('update')
    async updateCartItem(
        @Body() updateCartDto: UpdateCartDto,
        @GetCurrentUser() user: User,
    ): Promise<CartItemDto> {
        return this.cartService.updateCartItem(updateCartDto, user.id);
    }

    // DELETE
    @ApiOperation(
        { 
            summary: 'remove a product from the cart' 
        }
    )
    @Roles('user')
    @Delete('remove')
    async removeCartItem(
        @Body() removeFromCartDto: RemoveFromCartDto,
        @GetCurrentUser() user: User,
    ): Promise<void> {
        return this.cartService.removeCartItem(removeFromCartDto, user.id);
    }

    // get all
    @ApiOperation(
        { 
            summary: 'get all items in the cart' 
        }
    )
    @Roles('user') 
    @Get()
    async getCartItems(@GetCurrentUser() user: User): Promise<CartDto> {
        return this.cartService.getCartItems(user.id);
    }
}