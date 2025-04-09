import { Account } from 'src/accounts/entities/account.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Holder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  cpf: string;

  @OneToMany(() => Account, (account) => account.holder)
  accounts: Account[];
}
