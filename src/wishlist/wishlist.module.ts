import { Module } from "@nestjs/common";
import { WishlistService } from "./wishlist.service";
import { PrismaService } from "src/prisma/prisma.service";
import { WishlistController } from "./wishlist.controller";

@Module({
    imports: [],
    controllers: [WishlistController],
    providers: [WishlistService, PrismaService],
})

export class WishlistModule {}