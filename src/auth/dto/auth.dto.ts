import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class AuthDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;
    
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @Matches(/^(?=.*[0-9])/, {message: 'password must contain at least one number'})
    password: string;
}