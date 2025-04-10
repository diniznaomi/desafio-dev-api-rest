import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ManyToOne(() => Account, (account) => account.transactions)
  account: Account;

  @Column()
  @ApiProperty({ description: 'Account number' })
  accountNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  type: TransactionType;

  @CreateDateColumn()
  @ApiProperty({ description: 'Transaction date' })
  createdAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'Account balance after transaction' })
  newBalance: number;
}
