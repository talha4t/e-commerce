import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty(
        { 
            description: 'The reset token received from the forget password process', 
            example: 'reset-token-example' 
        }
    )
    @IsNotEmpty()
    @IsString()
    resetToken: string;

    @ApiProperty(
        { description: 'The new password for the user', 
            example: 'newPassword123!' 
        }
    )
    @IsNotEmpty()
    @IsString()
    newPassword: string;
}
