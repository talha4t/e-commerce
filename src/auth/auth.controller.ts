import { Body, Controller, HttpCode, HttpStatus, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, ForgetPasswordDto, LogoutDto, ResetPasswordDto, TokensDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { GetCurrentUser, GetCurrentUserId, Public } from "../common/decorators";
import { RtGuard } from "../common/guards";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    //TODO: register
    @Public()
    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation(
        { 
            summary: 'Register a new user' 
        }
    )
    @ApiResponse(
        { status: 201, 
            description: 'User successfully registered', 
            type: TokensDto 
        }
    )
    @ApiResponse(
        { 
            status: 400, 
            description: 'Bad Request' 
        }
    )
    async register(@Body() dto: AuthDto): Promise<TokensDto> {
        
        return this.authService.register(dto);
    }
    
    //TODO: login
    @Public()
    @Post('/login')
    @ApiOperation(
        { 
            summary: 'Logout the user' 
        }
    )
    @ApiResponse(
        { 
            status: 200, 
            description: 'User successfully logged out' 
        }
    )
    @ApiResponse(
        { 
            status: 401, 
            description: 'Unauthorized' 
        }
    )
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: AuthDto): Promise<TokensDto> {
        return this.authService.login(dto);
    }

    //TODO: logout
    @UseGuards(AuthGuard('jwt'))
    @Post('/logout')
    @ApiOperation(
        { 
            summary: 'Logout the user' 
        }
    )
    @ApiResponse(
        { status: 200, 
            description: 'User successfully logged out' 
        }
    )
    @ApiResponse(
        { 
            status: 401, 
            description: 'Unauthorized' 
        }
    )
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Body() dto: LogoutDto) {
        const user = req.user;
        return this.authService.logout(user['sub']);
    }

    // TODO: forget-password
    @Public()
    @Post('/forget-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation(
        { 
            summary: 'Request password reset for a user' 
        }
    )
    @ApiResponse(
        { 
            status: 200, 
            description: 'Reset password token sent to email' 
        }
    )
    @ApiResponse(
        { 
            status: 400, 
            description: 'Bad Request' 
        }
    )
    async forgetPassword(@Body() dto: ForgetPasswordDto) {
        return this.authService.forgetPassword(dto.email);
    }
    //TODO: reset-password
    @Public()
    @Put('/reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation(
        { 
            summary: 'Reset user password using a reset token' 
        }
    )
    @ApiResponse(
        { 
            status: 200, 
            description: 'Password successfully reset' 
        }
    )
    @ApiResponse(
        { 
            status: 400, 
            description: 'Bad Request' 
        }
    )
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(
            resetPasswordDto.newPassword,
            resetPasswordDto.resetToken,
        );
    }

    
    //TODO: refresh-token
    @Public()
    @UseGuards(RtGuard)
    @Post('/refresh-token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation(
        { 
            summary: 'Refresh user tokens' 
        }
    )
    @ApiResponse(
        { 
            status: 200, 
            description: 'Tokens successfully refreshed', 
            type: TokensDto
        }
    )
    @ApiResponse(
        { 
            status: 401, 
            description: 'Unauthorized' 
        }
    )
    async refreshTokens(
        @GetCurrentUserId() userId: number,
        @GetCurrentUser('refreshToken') refreshToken: string,
    ): Promise<TokensDto> {

        return this.authService.refreshTokens(userId, refreshToken);
    }
}