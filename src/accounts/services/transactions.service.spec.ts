import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Account } from '../entities/account.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { AccountStatus } from '../enums/account-status.enum';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  makeAccount,
  makeDepositDto,
  makeWithdrawDto,
  makeTransactionFilterDto,
} from '../../test/factories';
import { makeTransactions } from '../../test/factories/entities/transaction.factory';
import { ITransactionsService } from '../interfaces/transactions-service.interface';

jest.mock('date-fns-tz', () => ({
  toZonedTime: jest.fn((date) => date),
}));

describe('TransactionsService', () => {
  let service: ITransactionsService;
  let transactionRepo: jest.Mocked<Repository<Transaction>>;
  let accountRepo: jest.Mocked<Repository<Account>>;

  const mockTransactionRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockAccountRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepo,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepo = module.get(getRepositoryToken(Transaction));
    accountRepo = module.get(getRepositoryToken(Account));
  });

  describe('deposit', () => {
    it('should make a deposit successfully', async () => {
      const depositDto = makeDepositDto();
      const account = makeAccount({
        accountNumber: depositDto.accountNumber,
        status: AccountStatus.ACTIVE,
        balance: 100,
      });
      const expectedAmount = Number(depositDto.amount);
      const expectedNewBalance = Number(account.balance) + expectedAmount;

      const savedTransaction = {
        id: 'transaction-id',
        accountNumber: depositDto.accountNumber,
        amount: expectedAmount,
        type: TransactionType.DEPOSIT,
        createdAt: new Date(),
        newBalance: expectedNewBalance,
        account: makeAccount(),
      };

      accountRepo.findOne.mockResolvedValue(account);
      transactionRepo.create.mockReturnValue(savedTransaction);
      transactionRepo.save.mockResolvedValue(savedTransaction);

      const result = await service.deposit(depositDto);

      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber: depositDto.accountNumber },
      });
      expect(accountRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: expectedNewBalance,
        }),
      );
      expect(transactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          account,
          accountNumber: depositDto.accountNumber,
          amount: expectedAmount,
          type: TransactionType.DEPOSIT,
          newBalance: expectedNewBalance,
        }),
      );
      expect(result).toEqual({
        transactionId: savedTransaction.id,
        accountNumber: savedTransaction.accountNumber,
        amount: Number(savedTransaction.amount),
        type: savedTransaction.type,
        createdAt: savedTransaction.createdAt,
        newBalance: Number(savedTransaction.newBalance),
      });
    });

    it('should throw NotFoundException when account not found', async () => {
      const depositDto = makeDepositDto();
      accountRepo.findOne.mockResolvedValue(null);

      await expect(service.deposit(depositDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(accountRepo.save).not.toHaveBeenCalled();
      expect(transactionRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when account is not active', async () => {
      const depositDto = makeDepositDto();
      const account = makeAccount({
        accountNumber: depositDto.accountNumber,
        status: AccountStatus.BLOCKED,
      });

      accountRepo.findOne.mockResolvedValue(account);

      await expect(service.deposit(depositDto)).rejects.toThrow(
        ConflictException,
      );
      expect(accountRepo.save).not.toHaveBeenCalled();
      expect(transactionRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('should make a withdrawal successfully', async () => {
      const withdrawDto = makeWithdrawDto();
      const account = makeAccount({
        accountNumber: withdrawDto.accountNumber,
        status: AccountStatus.ACTIVE,
        balance: 1000,
      });

      const expectedAmount = Number(withdrawDto.amount);
      const expectedNewBalance = Number(account.balance) - expectedAmount;

      const savedTransaction = {
        id: 'transaction-id',
        accountNumber: withdrawDto.accountNumber,
        amount: expectedAmount,
        type: TransactionType.WITHDRAWAL,
        createdAt: new Date(),
        newBalance: expectedNewBalance,
        account: makeAccount(),
      };

      accountRepo.findOne.mockResolvedValue(account);
      transactionRepo.find.mockResolvedValue([]);
      transactionRepo.create.mockReturnValue(savedTransaction);
      transactionRepo.save.mockResolvedValue(savedTransaction);

      const result = await service.withdraw(withdrawDto);

      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber: withdrawDto.accountNumber },
      });
      expect(accountRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: expectedNewBalance,
        }),
      );
      expect(result).toEqual({
        transactionId: savedTransaction.id,
        accountNumber: savedTransaction.accountNumber,
        amount: Number(savedTransaction.amount),
        type: savedTransaction.type,
        createdAt: savedTransaction.createdAt,
        newBalance: Number(savedTransaction.newBalance),
      });
    });

    it('should throw NotFoundException when account not found', async () => {
      const withdrawDto = makeWithdrawDto();
      accountRepo.findOne.mockResolvedValue(null);

      await expect(service.withdraw(withdrawDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(accountRepo.save).not.toHaveBeenCalled();
      expect(transactionRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when account is not active', async () => {
      const withdrawDto = makeWithdrawDto();
      const account = makeAccount({
        accountNumber: withdrawDto.accountNumber,
        status: AccountStatus.BLOCKED,
      });

      accountRepo.findOne.mockResolvedValue(account);

      await expect(service.withdraw(withdrawDto)).rejects.toThrow(
        ConflictException,
      );
      expect(accountRepo.save).not.toHaveBeenCalled();
      expect(transactionRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when insufficient funds', async () => {
      const withdrawDto = makeWithdrawDto({ amount: 500 });
      const account = makeAccount({
        accountNumber: withdrawDto.accountNumber,
        status: AccountStatus.ACTIVE,
        balance: 100,
      });

      accountRepo.findOne.mockResolvedValue(account);

      await expect(service.withdraw(withdrawDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(accountRepo.save).not.toHaveBeenCalled();
      expect(transactionRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when daily withdrawal limit exceeded', async () => {
      const withdrawDto = makeWithdrawDto({ amount: 500 });
      const account = makeAccount({
        accountNumber: withdrawDto.accountNumber,
        status: AccountStatus.ACTIVE,
        balance: 2000,
      });

      const previousWithdrawals = makeTransactions(
        2,
        {
          accountNumber: withdrawDto.accountNumber,
          account,
          type: TransactionType.WITHDRAWAL,
        },
        (index) => ({
          amount: index === 0 ? 1000 : 600,
          newBalance: index === 0 ? 1000 : 400,
        }),
      );

      accountRepo.findOne.mockResolvedValue(account);
      transactionRepo.find.mockResolvedValue(previousWithdrawals);

      await expect(service.withdraw(withdrawDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(accountRepo.save).not.toHaveBeenCalled();
      expect(transactionRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('getAccountTransactions', () => {
    it('should return transactions for an account', async () => {
      const accountNumber = '123456';
      const account = makeAccount({ accountNumber });

      const transactions = makeTransactions(
        2,
        {
          accountNumber,
          account,
          type: TransactionType.DEPOSIT,
        },
        (index) => ({
          amount: (index + 1) * 100,
          newBalance: (index + 1) * 100 + (index > 0 ? 100 : 0),
        }),
      );

      accountRepo.findOne.mockResolvedValue(account);
      transactionRepo.find.mockResolvedValue(transactions);

      const result = await service.getAccountTransactions(accountNumber);

      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber },
      });
      expect(result).toEqual({
        total: transactions.length,
        history: expect.arrayContaining([
          expect.objectContaining({
            accountNumber,
          }),
        ]),
      });
    });

    it('should return filtered transactions by date range', async () => {
      const accountNumber = '123456';
      const account = makeAccount({ accountNumber });

      const transactions = makeTransactions(1, {
        accountNumber,
        account,
        type: TransactionType.DEPOSIT,
        amount: 100,
        newBalance: 100,
      });

      const filter = makeTransactionFilterDto();

      accountRepo.findOne.mockResolvedValue(account);
      transactionRepo.find.mockResolvedValue(transactions);

      const result = await service.getAccountTransactions(
        accountNumber,
        filter,
      );

      expect(transactionRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
          order: { createdAt: 'DESC' },
        }),
      );
      expect(result).toEqual({
        total: transactions.length,
        history: expect.arrayContaining([
          expect.objectContaining({
            accountNumber,
          }),
        ]),
      });
    });

    it('should return filtered transactions by type', async () => {
      const accountNumber = '123456';
      const account = makeAccount({ accountNumber });

      const transactions = makeTransactions(1, {
        accountNumber,
        account,
        type: TransactionType.DEPOSIT,
        amount: 100,
        newBalance: 100,
      });

      const filter = makeTransactionFilterDto({
        type: TransactionType.DEPOSIT,
      });

      accountRepo.findOne.mockResolvedValue(account);
      transactionRepo.find.mockResolvedValue(transactions);

      const result = await service.getAccountTransactions(
        accountNumber,
        filter,
      );

      expect(transactionRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: TransactionType.DEPOSIT,
          }),
        }),
      );
      expect(result).toEqual({
        total: transactions.length,
        history: expect.arrayContaining([
          expect.objectContaining({
            type: TransactionType.DEPOSIT,
          }),
        ]),
      });
    });

    it('should throw NotFoundException when account not found', async () => {
      const accountNumber = '123456';
      accountRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getAccountTransactions(accountNumber),
      ).rejects.toThrow(NotFoundException);
      expect(transactionRepo.find).not.toHaveBeenCalled();
    });
  });
});
