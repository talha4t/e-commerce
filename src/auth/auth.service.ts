import { 
    ConflictException, 
    ForbiddenException, 
    Injectable, 
    InternalServerErrorException, 
    UnauthorizedException 
} from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from 'argon2';
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "jsonwebtoken";
import * as crypto from 'crypto';
import { TokensDto } from "./dto";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }
    
    async register(dto: AuthDto): Promise<TokensDto> {
        const { email, password, name, role } = dto;

        try {
            const existingUser = await this.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new ConflictException('User already exists');
            }

            const hashedPassword = await argon.hash(password);

            const newUser = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: role ?? 'user'
                },
            });

            const tokens = await this.generateToken(newUser.id, newUser.email, newUser.role);

            await this.hashRefreshToken(newUser.id, tokens.refreshToken);

            return tokens;
        } catch (error) {
            console.error('Registration Error:', error);
            throw new InternalServerErrorException('Registration Failed!!');
        }
    }


    async login(dto: AuthDto) {
        try {
          const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
          });
    
          if (!user) {
            throw new ForbiddenException('Invalid credentials');
          }
    
          const passwordMatches = await argon.verify(user.password, dto.password);
    
          if (!passwordMatches) {
            throw new ForbiddenException('Invalid credentials');
          }
    
          const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
          };
    
          const tokens = await this.generateToken(payload.userId, payload.email, payload.role);
    
          await this.hashRefreshToken(user.id, tokens.refreshToken);
    
          return tokens;
          
        } catch (error) {
          console.error('Error during login:', error);
          throw new ForbiddenException('Login failed');
        }
    }

    async logout(userId: number) {
        try {
            await this.prisma.user.updateMany({
                where: {
                    id: userId,
                    hashedRT: {
                        not: null,
                    },
                },
                data: {
                    hashedRT: null,
                },
            })
        } catch (error) {
            throw new Error('Logout failed'); 
        }
    }

    async forgetPassword(email: string) {
        try {
            const user = await this.prisma.user.findUnique(
                { 
                    where: { 
                        email 
                    } 
                }
            );

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const resetToken = this.generateResetToken();
            await this.prisma.user.update({
                where: { 
                    id: user.id 
                },
                data: { 
                    hashedRT: await argon.hash(resetToken) 
                },
            });

            return { resetToken };
        } catch (error) {
            throw new InternalServerErrorException('Failed to process password reset request');
        }
    }
    
    async resetPassword(newPassword: string, resetToken: string) {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    hashedRT: {
                        not: null,
                    },
                },
            });
    
            if (!user) {
                throw new UnauthorizedException('Invalid or expired reset token');
            }
    
            const tokenMatches = await argon.verify(user.hashedRT, resetToken);
    
            if (!tokenMatches) {
                throw new UnauthorizedException('Invalid or expired reset token');
            }
    
            const hashedPassword = await argon.hash(newPassword);
    
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    hashedRT: null,
                },
            });
    
            return {
                message: 'Password successfully reset',
            };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Failed to reset password');
        }
    }

    async refreshTokens(userId: number, refreshToken: string): Promise<TokensDto> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            if (!user || !user.hashedRT) {
                console.error('User not found for UserId:', userId);
                throw new ForbiddenException('Access Denied');
            }
            
            const rtMatches = await argon.verify(user.hashedRT, refreshToken);
            
            if (!rtMatches) {
                throw new ForbiddenException('Invalid refresh token');
            }
            
            const tokens = await this.generateToken(user.id, user.email, user.role);
            
            await this.hashRefreshToken(user.id, tokens.refreshToken);
            
            return tokens;
            
        } catch (error) {
            console.error('Error in refreshTokens:', error); 
            throw new ForbiddenException('Access Denied');
        }
    }
    
    // generate reset token
    private generateResetToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    // generate token
    private async generateToken(userId: number, email: string, role: string): Promise<TokensDto> {
        const payload: JwtPayload = { userId, email, role };

        try {
            const [accessToken, refreshToken] = await Promise.all([
                this.jwtService.signAsync(payload, {
                    secret: process.env.ACCESS_TOKEN_SECRET,
                    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
                }),

                this.jwtService.signAsync(payload, {
                    secret: process.env.REFRESH_TOKEN_SECRET,
                    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,   
                }),
            ]);
            
            return {
                accessToken,
                refreshToken
            }
            
        } catch (error) {
            throw new InternalServerErrorException('Token generation failed!!')
        }
    }

    // TODO: hash refresh token
    private async hashRefreshToken(userId: number, refreshToken: string) {
        try {
            const hash = await argon.hash(refreshToken);

            await this.prisma.user.update({
                where: { id: userId },
                data: { hashedRT: hash },
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to hash refresh token!!');
        }
    }
}