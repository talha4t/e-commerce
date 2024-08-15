import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'The user ID to log out',
    example: 1,
  })
  userId: number;
}
