import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token for authentication',
  })
  token: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Refresh token for getting a new JWT token',
  })
  refreshToken: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The user ID',
  })
  userId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The user email',
  })
  email: string;
}
