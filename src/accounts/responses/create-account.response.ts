import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountResponse {
  @ApiProperty({
    description: 'Account ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Account number',
    example: '123456',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'Agency number',
    example: '0001',
  })
  agency: string;
}
