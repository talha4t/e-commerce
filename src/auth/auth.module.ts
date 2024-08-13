import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AtStrategy, RtStrategy } from "./strategies";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "src/prisma/prisma.module";
// import { MailerModule } from "@nestjs-modules/mailer";

@Module({
    imports: [JwtModule.register({
        secret: process.env.ACCESS_TOKEN_SECRET,
        signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },

    }), 
    PrismaModule,
    // MailerModule.forRoot({
    //     // email
    // })
    ],
    controllers: [AuthController],
    providers: [AuthService, AtStrategy, RtStrategy], 
})
export class AuthModule {}