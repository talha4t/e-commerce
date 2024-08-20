import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { AdminGuard, UserGuard } from "src/common/guards";
import { CloudinaryService } from "src/config/cloudinary.config";

@Module({
    imports: [JwtModule.register({})],
    controllers: [ProductController],
    providers: [
        ProductService, 
        UserGuard, 
        AdminGuard,
        CloudinaryService,
    ]

})
export class ProductModule {}