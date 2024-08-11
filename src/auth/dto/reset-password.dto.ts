import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class ResetPasswordDto {

    @IsString()
    resetToken: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @Matches(/^(?=.*[0-9])/, {message: 'password must contain at least one number'})
    newPassword: string;
}