import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountStatus } from '../enums/account-status.enum';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  makeCreateAccountDto,
  makeAccount,
  makeUpdateStatusDto,
  makeAccountResponseDto,
} from '../../test/factories';
import { IAccountsService } from '../interfaces/accounts-service.interface';

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: IAccountsService;

  const mockAccountsService = {
    createByCpf: jest.fn(),
    findByCpfOrAccount: jest.fn(),
    updateAccountStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: 'IAccountsService',
          useValue: mockAccountsService,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<IAccountsService>('IAccountsService');

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an account successfully', async () => {
      const createAccountDto = makeCreateAccountDto();
      const mockAccount = makeAccount({
        accountNumber: '123456',
        agency: '0001',
        balance: 0,
        status: AccountStatus.ACTIVE,
        holder: {
          id: 'holder-id',
          fullName: 'Test User',
          cpf: createAccountDto.cpf,
          accounts: [],
        },
      });

      mockAccountsService.createByCpf.mockResolvedValue(mockAccount);

      await controller.create(createAccountDto);

      expect(service.createByCpf).toHaveBeenCalledWith(createAccountDto);
    });

    it('should propagate errors from service', async () => {
      const createAccountDto = makeCreateAccountDto();

      mockAccountsService.createByCpf.mockRejectedValue(
        new NotFoundException('Holder not found for provided CPF'),
      );

      await expect(controller.create(createAccountDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.createByCpf).toHaveBeenCalledWith(createAccountDto);
    });
  });

  describe('findByCpfOrAccount', () => {
    it('should find account by CPF successfully', async () => {
      const cpf = '12345678901';

      await controller.findByCpfOrAccount(cpf);

      expect(service.findByCpfOrAccount).toHaveBeenCalledWith(cpf);
    });

    it('should find account by account number successfully', async () => {
      const accountNumber = '123456';

      await controller.findByCpfOrAccount(accountNumber);

      expect(service.findByCpfOrAccount).toHaveBeenCalledWith(accountNumber);
    });

    it('should throw NotFoundException when account is not found', async () => {
      const value = '12345678901';
      mockAccountsService.findByCpfOrAccount.mockRejectedValue(
        new NotFoundException('Account not found'),
      );

      await expect(controller.findByCpfOrAccount(value)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.findByCpfOrAccount).toHaveBeenCalledWith(value);
    });
  });

  describe('updateAccountStatus', () => {
    it('should update account status to BLOCKED successfully', async () => {
      const accountNumber = '123456';
      const updateStatusDto = makeUpdateStatusDto(AccountStatus.BLOCKED);

      await controller.updateAccountStatus(accountNumber, updateStatusDto);

      expect(service.updateAccountStatus).toHaveBeenCalledWith(
        accountNumber,
        updateStatusDto,
      );
    });

    it('should update account status to ACTIVE successfully', async () => {
      const accountNumber = '123456';
      const updateStatusDto = makeUpdateStatusDto(AccountStatus.ACTIVE);

      mockAccountsService.updateAccountStatus.mockResolvedValue(undefined);

      const result = await controller.updateAccountStatus(
        accountNumber,
        updateStatusDto,
      );

      expect(service.updateAccountStatus).toHaveBeenCalledWith(
        accountNumber,
        updateStatusDto,
      );
      expect(result).toEqual({ message: 'Account active successfully' });
    });

    it('should update account status to CLOSED successfully', async () => {
      const accountNumber = '123456';
      const updateStatusDto = makeUpdateStatusDto(AccountStatus.CLOSED);

      mockAccountsService.updateAccountStatus.mockResolvedValue(undefined);

      const result = await controller.updateAccountStatus(
        accountNumber,
        updateStatusDto,
      );

      expect(service.updateAccountStatus).toHaveBeenCalledWith(
        accountNumber,
        updateStatusDto,
      );
      expect(result).toEqual({ message: 'Account closed successfully' });
    });

    it('should throw ConflictException when status transition is invalid', async () => {
      const accountNumber = '123456';
      const updateStatusDto = makeUpdateStatusDto(AccountStatus.BLOCKED);

      mockAccountsService.updateAccountStatus.mockRejectedValue(
        new ConflictException('Closed accounts cannot be blocked'),
      );

      await expect(
        controller.updateAccountStatus(accountNumber, updateStatusDto),
      ).rejects.toThrow(ConflictException);

      expect(service.updateAccountStatus).toHaveBeenCalledWith(
        accountNumber,
        updateStatusDto,
      );
    });
  });
});
