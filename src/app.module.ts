import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HoldersModule } from './holders/holders.module';
import { AccountsModule } from './accounts/accounts.module';
import { Holder } from './holders/entities/holder.entity';
import { Account } from './accounts/entities/account.entity';
import { Transaction } from './accounts/entities/transaction.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [Holder, Account, Transaction],
    }),
    HoldersModule,
    AccountsModule,
    AuthModule,
  ],
})
export class AppModule {}
