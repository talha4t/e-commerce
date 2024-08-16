import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { AtGuard, RolesGuard } from "../common/guards";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateOrderDto, UpdateOrderDto } from "./dto";
import { GetCurrentUser } from "src/common/decorators";
import { User } from "@prisma/client";

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('/api/v1/orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    //CREATE
    @ApiOperation({
        summary: 'create a new order'
    })
    @Post()
    async createOrder(
        @Body() createOrderDto: CreateOrderDto,
        @GetCurrentUser('id') id: string,
    ): Promise<{ orderId: number }> {

        const userId = parseInt(id, 10);

        console.log('controller', userId);
        
        const orderId = await this.orderService.createOrder(createOrderDto, userId);

        return {
            orderId,
        };
    }

    // UPDATE
    @ApiOperation({
        summary: 'update an order status'
    })
    @Patch(':id')
    async updateOrder(
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto
    ): Promise<void> {
        const orderId = parseInt(id, 10);

        await this.orderService.updateOrder(orderId, updateOrderDto.status)
    }

    // get order by ID
    @ApiOperation({
        summary: 'get order by ID'
    })
    @Get(':id')
    async getOrderById(@Param('id') id: string): Promise<any> {
        const orderId = parseInt(id, 10);

        return this.orderService.getOrderById(orderId);
    }

    // history
    @ApiOperation({
        summary: 'get all orders for the current user'
    })
    @Get('history')
    async getOrderHistory(@GetCurrentUser() user: User): Promise<any> {
        return this.orderService.getOrderHistory(user.id);
    }

}