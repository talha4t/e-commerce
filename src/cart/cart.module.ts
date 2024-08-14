import { Module } from "@nestjs/common";
import { ProductModule } from "../product/product.module";
import { AuthModule } from "../auth/auth.module";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
    imports: [ProductModule, AuthModule],
    controllers: [CartController],
    providers: [CartService, PrismaService],
    exports: [CartService]
})
export class CartModule {}