import { ApiProperty } from "@nestjs/swagger";

export class TokensDto {
  @ApiProperty(
    { 
      description: 'Access token' 
    }
  )
  accessToken: string;

  @ApiProperty(
    { 
      description: 'Refresh token' 
    }
  )
  refreshToken: string;
}
