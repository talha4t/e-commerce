import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AtGuard } from "./common/guards";
import { ProductModule } from "./product/product.module";
import { CartModule } from "./cart/cart.module";
import { OrderModule } from "./order/order.module";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { CloudinaryService } from "./config/cloudinary.config";
import { WishlistModule } from "./wishlist/wishlist.module";
import { ClientsModule, Transport } from "@nestjs/microservices";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10,
        limit: 2,
      },
    ]),

    ClientsModule.register([
      {
        name: "MATH_SERVICE",
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        },
      },
    ]),
    AuthModule,
    ProductModule,
    CartModule,
    OrderModule,
    WishlistModule,
  ],

  controllers: [],

  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    CloudinaryService,
  ],
})
export class AppModule {}
