import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Holder } from '../../holders/entities/holder.entity';
import { AccountStatus } from '../enums/account-status.enum';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountNumber: string;

  @Column()
  agency: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @ManyToOne(() => Holder, (holder) => holder.accounts, { eager: true })
  holder: Holder;
}
