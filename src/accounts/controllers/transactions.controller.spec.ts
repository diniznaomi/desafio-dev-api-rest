import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { NotFoundException } from '@nestjs/common';
import { TransactionType } from '../enums/transaction-type.enum';
import {
  makeDepositDto,
  makeWithdrawDto,
  makeTransactionResponse,
  makeTransactionFilterDto,
} from '../../test/factories';
import { ITransactionsService } from '../interfaces/transactions-service.interface';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: ITransactionsService;

  const mockTransactionsService = {
    deposit: jest.fn(),
    withdraw: jest.fn(),
    getAccountTransactions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: 'ITransactionsService',
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<ITransactionsService>('ITransactionsService');

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deposit', () => {
    it('should create a deposit successfully', async () => {
      const depositDto = makeDepositDto();

      await controller.deposit(depositDto);

      expect(service.deposit).toHaveBeenCalledWith(depositDto);
    });

    it('should throw Exception', async () => {
      const withdrawDto = makeWithdrawDto();
      mockTransactionsService.withdraw.mockRejectedValue(
        new NotFoundException('Account not found'),
      );

      await expect(controller.withdraw(withdrawDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.withdraw).toHaveBeenCalledWith(withdrawDto);
    });
  });

  describe('getTransactions', () => {
    it('should get transactions successfully', async () => {
      const accountNumber = '123456';
      const mockResponse = {
        total: 2,
        history: [
          makeTransactionResponse({ accountNumber }),
          makeTransactionResponse({ accountNumber }),
        ],
      };
      mockTransactionsService.getAccountTransactions.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getTransactions(accountNumber, {});

      expect(service.getAccountTransactions).toHaveBeenCalledWith(
        accountNumber,
        {},
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get filtered transactions by date range', async () => {
      const accountNumber = '123456';
      const filter = makeTransactionFilterDto({
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      });

      const mockResponse = {
        total: 1,
        history: [makeTransactionResponse({ accountNumber })],
      };
      mockTransactionsService.getAccountTransactions.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getTransactions(accountNumber, filter);

      expect(service.getAccountTransactions).toHaveBeenCalledWith(
        accountNumber,
        filter,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get filtered transactions by type', async () => {
      const accountNumber = '123456';
      const filter = makeTransactionFilterDto({
        type: TransactionType.DEPOSIT,
      });

      const mockResponse = {
        total: 1,
        history: [
          makeTransactionResponse({
            accountNumber,
            type: TransactionType.DEPOSIT,
          }),
        ],
      };
      mockTransactionsService.getAccountTransactions.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getTransactions(accountNumber, filter);

      expect(service.getAccountTransactions).toHaveBeenCalledWith(
        accountNumber,
        filter,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException when account not found', async () => {
      const accountNumber = '123456';
      mockTransactionsService.getAccountTransactions.mockRejectedValue(
        new NotFoundException('Account not found'),
      );

      await expect(
        controller.getTransactions(accountNumber, {}),
      ).rejects.toThrow(NotFoundException);
      expect(service.getAccountTransactions).toHaveBeenCalledWith(
        accountNumber,
        {},
      );
    });
  });
});
