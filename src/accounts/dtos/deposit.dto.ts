import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
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
    description: 'Amount to deposit',
    example: 100.5,
  })
  amount: number;
}
