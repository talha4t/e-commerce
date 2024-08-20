import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class AuthDto {
    @ApiPropertyOptional({ 
        description: 'The name of the user', 
        example: 'Talha Mahmud' 
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;
    
    @ApiProperty({
        description: 'The email address of the user', 
        example: 'mahmudtalha80@gmail.com' 
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @ApiProperty({ 
        description: 'The password of the user', 
        example: 'password123', 
        minLength: 6 
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ 
        description: 'The role of the user (optional)', 
        example: 'user',
        enum: ['user', 'admin']
    })
    @IsOptional()
    @IsString()
    @IsIn(
        ['user', 'admin'], 
        { 
            message: 'role must be either "user" or "admin"' 
        })
    role?: string;
}