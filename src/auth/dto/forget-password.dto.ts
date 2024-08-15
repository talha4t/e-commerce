import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The email address of the user who wants to reset the password',
        example: 'mahmudtalha80@gmail.com',
        required: true
    })
    email: string;
}
