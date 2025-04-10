import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  FindOptionsWhere,
  MoreThanOrEqual,
} from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Account } from '../entities/account.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { DepositDto } from '../dtos/deposit.dto';
import { WithdrawDto } from '../dtos/withdraw.dto';
import { AccountStatus } from '../enums/account-status.enum';
import { TransactionResponse } from '../responses/transaction.response';
import { startOfDay, endOfDay, subMonths } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TransactionFilterDto } from '../dtos/transaction-filter.dto';
import { ITransactionsService } from '../interfaces/transactions-service.interface';

@Injectable()
export class TransactionsService implements ITransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly DAILY_WITHDRAWAL_LIMIT = 2000;
  private readonly SP_TIMEZONE = 'America/Sao_Paulo';

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async deposit(depositData: DepositDto): Promise<TransactionResponse> {
    this.logger.log(
      `Processing deposit to account: ${depositData.accountNumber}`,
    );

    const account = await this.accountRepo.findOne({
      where: { accountNumber: depositData.accountNumber },
    });

    if (!account) {
      this.logger.warn(`Account not found: ${depositData.accountNumber}`);
      throw new NotFoundException('Account not found');
    }

    if (account.status !== AccountStatus.ACTIVE) {
      this.logger.warn(
        `Cannot deposit to inactive account: ${depositData.accountNumber}, status: ${account.status}`,
      );
      throw new ConflictException(
        'Deposits can only be made to active accounts',
      );
    }

    const amount = Number(depositData.amount);
    this.logger.debug(`Deposit amount: ${amount}`);

    const currentBalance = Number(account.balance);
    account.balance = currentBalance + amount;

    this.logger.debug(
      `Updating balance from ${currentBalance} to ${account.balance}`,
    );
    await this.accountRepo.save(account);

    const transaction = this.transactionRepo.create({
      account,
      accountNumber: account.accountNumber,
      amount: amount,
      type: TransactionType.DEPOSIT,
      newBalance: Number(account.balance),
      createdAt: this.getSaoPauloDateTime(),
    });

    const savedTransaction = await this.transactionRepo.save(transaction);
    this.logger.log(
      `Deposit completed successfully, transaction ID: ${savedTransaction.id}`,
    );

    return {
      transactionId: savedTransaction.id,
      accountNumber: savedTransaction.accountNumber,
      amount: Number(savedTransaction.amount),
      type: savedTransaction.type,
      createdAt: savedTransaction.createdAt,
      newBalance: Number(savedTransaction.newBalance),
    };
  }

  async withdraw(withdrawData: WithdrawDto): Promise<TransactionResponse> {
    this.logger.log(
      `Processing withdrawal from account: ${withdrawData.accountNumber}`,
    );

    const account = await this.accountRepo.findOne({
      where: { accountNumber: withdrawData.accountNumber },
    });

    if (!account) {
      this.logger.warn(`Account not found: ${withdrawData.accountNumber}`);
      throw new NotFoundException('Account not found');
    }

    if (account.status !== AccountStatus.ACTIVE) {
      this.logger.warn(
        `Cannot withdraw from inactive account: ${withdrawData.accountNumber}, status: ${account.status}`,
      );
      throw new ConflictException(
        'Withdrawals can only be made from active accounts',
      );
    }

    const amount = Number(withdrawData.amount);
    this.logger.debug(`Withdrawal amount: ${amount}`);

    const currentBalance = Number(account.balance);

    if (currentBalance < amount) {
      this.logger.warn(
        `Insufficient funds: balance ${currentBalance}, requested ${amount}`,
      );
      throw new BadRequestException('Insufficient funds');
    }

    await this.checkDailyWithdrawalLimit(account.accountNumber, amount);

    account.balance = currentBalance - amount;
    this.logger.debug(
      `Updating balance from ${currentBalance} to ${account.balance}`,
    );
    await this.accountRepo.save(account);

    const transaction = this.transactionRepo.create({
      account,
      accountNumber: account.accountNumber,
      amount: amount,
      type: TransactionType.WITHDRAWAL,
      newBalance: Number(account.balance),
      createdAt: this.getSaoPauloDateTime(),
    });

    const savedTransaction = await this.transactionRepo.save(transaction);
    this.logger.log(
      `Withdrawal completed successfully, transaction ID: ${savedTransaction.id}`,
    );

    return {
      transactionId: savedTransaction.id,
      accountNumber: savedTransaction.accountNumber,
      amount: Number(savedTransaction.amount),
      type: savedTransaction.type,
      createdAt: savedTransaction.createdAt,
      newBalance: Number(savedTransaction.newBalance),
    };
  }

  async getAccountTransactions(
    accountNumber: string,
    filter?: TransactionFilterDto,
  ): Promise<{ total: number; history: TransactionResponse[] }> {
    const account = await this.accountRepo.findOne({
      where: { accountNumber },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const now = this.getSaoPauloDateTime();
    const sixMonthsAgo = subMonths(now, 6);

    let startDate = sixMonthsAgo;
    let endDate: Date | null = null;

    if (filter?.startDate) {
      const start = startOfDay(toZonedTime(filter.startDate, this.SP_TIMEZONE));
      startDate = start < sixMonthsAgo ? sixMonthsAgo : start;
    }

    if (filter?.endDate) {
      endDate = endOfDay(toZonedTime(filter.endDate, this.SP_TIMEZONE));
    }

    const whereConditions: FindOptionsWhere<Transaction> = {
      accountNumber,
      ...(filter?.type && { type: filter.type }),
      createdAt: endDate
        ? Between(startDate, endDate)
        : MoreThanOrEqual(startDate),
    };

    const transactions = await this.transactionRepo.find({
      where: whereConditions,
      order: { createdAt: 'DESC' },
    });

    return {
      total: transactions.length,
      history: transactions.map((transaction) => ({
        transactionId: transaction.id,
        accountNumber: transaction.accountNumber,
        amount: Number(transaction.amount),
        type: transaction.type,
        createdAt: transaction.createdAt,
        newBalance: Number(transaction.newBalance),
      })),
    };
  }

  private async checkDailyWithdrawalLimit(
    accountNumber: string,
    amount: number,
  ): Promise<void> {
    const today = this.getSaoPauloDateTime();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const withdrawals = await this.transactionRepo.find({
      where: {
        accountNumber,
        type: TransactionType.WITHDRAWAL,
        createdAt: Between(todayStart, todayEnd),
      },
    });

    const dailyWithdrawalTotal = withdrawals.reduce(
      (total, transaction) => total + Number(transaction.amount),
      0,
    );

    if (dailyWithdrawalTotal + amount > this.DAILY_WITHDRAWAL_LIMIT) {
      throw new BadRequestException(
        `Daily withdrawal limit of ${this.DAILY_WITHDRAWAL_LIMIT} exceeded`,
      );
    }
  }

  private getSaoPauloDateTime(date?: Date): Date {
    const nowUtc = new Date();
    return toZonedTime(date ?? nowUtc, this.SP_TIMEZONE);
  }
}
