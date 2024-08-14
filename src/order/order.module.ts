import { Module } from "@nestjs/common";
import { CartModule } from "src/cart/cart.module";
import { ProductModule } from "src/product/product.module";
import { OrderController } from "./order.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { OrderService } from "./order.service";

@Module({
    imports: [CartModule, ProductModule],
    controllers: [OrderController],
    providers: [PrismaService, OrderService],
    exports: [OrderService]
})

export class OrderModule {}