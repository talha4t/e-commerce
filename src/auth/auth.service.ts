import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from 'argon2';
import { Tokens } from "./types";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "jsonwebtoken";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }
    


    async register(dto: AuthDto): Promise<Tokens> {
        const { email, password, name } = dto;

        try {
            // Check if user already exists
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
                },
            });

            const tokens = await this.generateToken(newUser.id, newUser.email);

            await this.hashRefreshToken(newUser.id, tokens.refreshToken);

            return tokens;
        } catch (error) {
            throw new Error('Registration Failed!!');
        }
    }


    async login(dto: AuthDto): Promise<Tokens> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
    
            if (!user) {
                throw new ForbiddenException('User not found');
            }
    
            const passwordMatches = await argon.verify(user.password, dto.password);
            if (!passwordMatches) { 
                throw new ForbiddenException('Invalid password');
            }
    
            const tokens = await this.generateToken(user.id, user.email);
    
            await this.hashRefreshToken(user.id, tokens.refreshToken);
    
            return tokens;

        } catch (error) {
            throw new ForbiddenException('Unable to login');
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

    async resetPassword(newPassword: string, resetToken: string) {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    hashedRT: resetToken,
                },
            });

            if (!user) {
                throw new UnauthorizedException('invalid reset token');
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
                message: 'password reset successfully',
            }

        } catch (error) {
            throw new InternalServerErrorException('Failed to reset password');
        }
    }

    async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
        console.log('ewww', userId, refreshToken);
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

            const tokens = await this.generateToken(user.id, user.email);
    
            await this.hashRefreshToken(user.id, tokens.refreshToken);
    
            return tokens;

        } catch (error) {
            console.error('Error in refreshTokens:', error); 
            throw new ForbiddenException('Access Denied');
        }
    }

    // TODO: generate token
    async generateToken(userId: number, email: string): Promise<Tokens> {
        const payload: JwtPayload = { userId, email };

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
    async hashRefreshToken(userId: number, refreshToken: string) {
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

//hashed refresh token