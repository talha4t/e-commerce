import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { AtGuard, RolesGuard } from "../common/guards";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateOrderDto, UpdateOrderDto } from "./dto";
import { GetCurrentUser, Roles } from "src/common/decorators";
import { User } from "@prisma/client";

@ApiTags("Orders")
@ApiBearerAuth()
@UseGuards(AtGuard)
@Controller("/api/v1/orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  //CREATE
  @ApiOperation({
    summary: "create a new order",
  })
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetCurrentUser("id") id: string
  ): Promise<{ orderId: number }> {
    const userId = parseInt(id, 10);

    console.log("controller", userId);

    const orderId = await this.orderService.createOrder(createOrderDto, userId);

    return {
      orderId,
    };
  }

  // UPDATE
  @ApiOperation({
    summary: "update an order status",
  })
  @Roles("admin") // Only admin can update order status
  @Patch(":id")
  async updateOrder(
    @Param("id") id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ): Promise<void> {
    const orderId = parseInt(id, 10);

    await this.orderService.updateOrder(orderId, updateOrderDto.status);
  }

  // history
  @ApiOperation({
    summary: "get all orders for the current user",
  })
  // @UseGuards(RolesGuard)
  @Roles("admin", "user") // Allow both admin and user roles
  @Get("history")
  async getOrderHistory(@GetCurrentUser() user: User): Promise<any> {
    return this.orderService.getOrderHistory(user.id);
  }

  // get order by ID
  @ApiOperation({
    summary: "get order by ID",
  })
  @Roles("admin", "user") // Allow both admin and user roles
  @Get(":id")
  async getOrderById(@Param("id") id: string): Promise<any> {
    return this.orderService.getOrderById(id);
  }
}
