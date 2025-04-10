import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '../enums/account-status.enum';

export class AccountResponseDto {
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

  @ApiProperty({
    description: 'Account balance',
    example: 1000.5,
  })
  balance: number;

  @ApiProperty({
    description: 'Account status',
    example: 'blocked',
  })
  status: AccountStatus;
}
