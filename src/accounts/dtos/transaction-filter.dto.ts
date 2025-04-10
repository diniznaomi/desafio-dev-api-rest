import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enums/transaction-type.enum';

export class TransactionFilterDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Start date for filtering transactions',
    example: '2023-01-01',
    required: false,
  })
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'End date for filtering transactions',
    example: '2023-12-31',
    required: false,
  })
  endDate?: Date;

  @IsOptional()
  @IsEnum(TransactionType)
  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    required: false,
    example: TransactionType.DEPOSIT,
  })
  type?: TransactionType;
}
