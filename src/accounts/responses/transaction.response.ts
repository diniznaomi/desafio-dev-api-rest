import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enums/transaction-type.enum';

export class TransactionResponse {
  @ApiProperty({ description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ description: 'Account number' })
  accountNumber: string;

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ description: 'Transaction type' })
  type: TransactionType;

  @ApiProperty({ description: 'Transaction date' })
  createdAt: Date;

  @ApiProperty({ description: 'Account balance after transaction' })
  newBalance: number;
}
