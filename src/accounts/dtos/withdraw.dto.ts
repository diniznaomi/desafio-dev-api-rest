import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Account number',
    example: '123456',
  })
  accountNumber: string;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({
    description: 'Amount to withdraw',
    example: 100.5,
  })
  amount: number;
}
