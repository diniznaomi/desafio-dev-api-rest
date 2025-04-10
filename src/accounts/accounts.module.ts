import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { Holder } from '../holders/entities/holder.entity';
import { AccountsService } from './services/accounts.service';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './controllers/transactions.controller';
import { AccountsController } from './controllers/accounts.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Holder, Transaction]),
    AuthModule,
  ],
  controllers: [AccountsController, TransactionsController],
  providers: [
    {
      provide: 'IAccountsService',
      useClass: AccountsService,
    },
    {
      provide: 'ITransactionsService',
      useClass: TransactionsService,
    },
    AuthModule,
  ],
  exports: ['IAccountsService', 'ITransactionsService'],
})
export class AccountsModule {}
