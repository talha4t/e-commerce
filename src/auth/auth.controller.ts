import { Body, Controller, HttpCode, HttpStatus, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, ResetPasswordDto } from "./dto";
import { Tokens } from "./types";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { GetCurrentUser, GetCurrentUserId, Public } from "../common/decorators";
import { RtGuard } from "../common/guards";

@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    //TODO: register
    @Public()
    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: AuthDto): Promise<Tokens> {
        
        return this.authService.register(dto);
    }
    
    //TODO: login
    @Public()
    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.login(dto);
    }

    //TODO: logout
    @UseGuards(AuthGuard('jwt'))
    @Post('/logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request) {
        const user = req.user;

        return this.authService.logout(user['sub']);
    }

    //TODO: reset-password
    @Public()
    @Put('/reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(
            resetPasswordDto.newPassword,
            resetPasswordDto.resetToken,
        );
    }

    // reset password reset
    // @Public()
    // @Post('/request-password-reset')
    // @HttpCode(HttpStatus.OK)
    // async requestPasswordReset(@Body() { email }: { email: string }) {
    //     return this.authService.requestPasswordReset(email);
    // }

    
    //TODO: refresh-token
    @Public()
    @UseGuards(RtGuard)
    @Post('/refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(
        @GetCurrentUserId() userId: number,
        @GetCurrentUser('refreshToken') refreshToken: string,
    ): Promise<Tokens> {

        return this.authService.refreshTokens(userId, refreshToken);
    }
}