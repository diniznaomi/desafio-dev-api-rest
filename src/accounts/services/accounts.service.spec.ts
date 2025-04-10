import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsService } from './accounts.service';
import { Account } from '../entities/account.entity';
import { Holder } from '../../holders/entities/holder.entity';
import { AccountStatus } from '../enums/account-status.enum';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  makeCreateAccountDto,
  makeAccount,
  makeHolder,
  makeUpdateStatusDto,
} from '../../test/factories';
import { IAccountsService } from '../interfaces/accounts-service.interface';

describe('AccountsService', () => {
  let service: IAccountsService;
  let accountRepo: jest.Mocked<Repository<Account>>;
  let holderRepo: jest.Mocked<Repository<Holder>>;

  const mockAccountRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockHolderRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepo,
        },
        {
          provide: getRepositoryToken(Holder),
          useValue: mockHolderRepo,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    accountRepo = module.get(getRepositoryToken(Account));
    holderRepo = module.get(getRepositoryToken(Holder));

    process.env.AGENCY_NUMBER = '0001';
  });

  describe('createByCpf', () => {
    it('should create a new account successfully', async () => {
      const createAccountDto = makeCreateAccountDto();
      const holder = makeHolder({ cpf: createAccountDto.cpf });
      const account = makeAccount({
        id: 'uuid-test',
        holder,
        accountNumber: '123456',
        agency: '0001',
        balance: 0,
        status: AccountStatus.ACTIVE,
      });

      holderRepo.findOne.mockResolvedValue(holder);
      accountRepo.findOne.mockResolvedValue(null);
      accountRepo.create.mockReturnValue(account);
      accountRepo.save.mockResolvedValue(account);

      jest.spyOn(service, 'generateAccountNumber').mockResolvedValue('123456');

      const result = await service.createByCpf(createAccountDto);

      expect(holderRepo.findOne).toHaveBeenCalledWith({
        where: { cpf: createAccountDto.cpf },
      });
      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { holder: { id: holder.id } },
      });
      expect(accountRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          holder,
          accountNumber: '123456',
          agency: '0001',
          balance: 0.0,
          status: AccountStatus.ACTIVE,
        }),
      );
      expect(accountRepo.save).toHaveBeenCalledWith(account);
      expect(result).toEqual({
        id: account.id,
        accountNumber: account.accountNumber,
        agency: account.agency,
      });
    });

    it('should throw NotFoundException when holder not found', async () => {
      const createAccountDto = makeCreateAccountDto();
      holderRepo.findOne.mockResolvedValue(null);

      await expect(service.createByCpf(createAccountDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(holderRepo.findOne).toHaveBeenCalledWith({
        where: { cpf: createAccountDto.cpf },
      });
      expect(accountRepo.create).not.toHaveBeenCalled();
      expect(accountRepo.save).not.toHaveBeenCalled();
    });

    it('should reactivate a closed account', async () => {
      const createAccountDto = makeCreateAccountDto();
      const holder = makeHolder({ cpf: createAccountDto.cpf });
      const existingAccount = makeAccount({
        id: 'uuid-test',
        holder,
        accountNumber: '123456',
        agency: '0001',
        status: AccountStatus.CLOSED,
      });

      const reactivatedAccount = {
        ...existingAccount,
        status: AccountStatus.ACTIVE,
      };

      holderRepo.findOne.mockResolvedValue(holder);
      accountRepo.findOne.mockResolvedValue(existingAccount);
      accountRepo.save.mockResolvedValue(reactivatedAccount);

      const result = await service.createByCpf(createAccountDto);

      expect(holderRepo.findOne).toHaveBeenCalledWith({
        where: { cpf: createAccountDto.cpf },
      });
      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { holder: { id: holder.id } },
      });
      expect(accountRepo.save).toHaveBeenCalledWith({
        ...existingAccount,
        status: AccountStatus.ACTIVE,
      });
      expect(result).toEqual({
        id: reactivatedAccount.id,
        accountNumber: reactivatedAccount.accountNumber,
        agency: reactivatedAccount.agency,
      });
    });

    it('should throw ConflictException when account already exists and is active', async () => {
      const createAccountDto = makeCreateAccountDto();
      const holder = makeHolder({ cpf: createAccountDto.cpf });
      const existingAccount = makeAccount({
        holder,
        status: AccountStatus.ACTIVE,
      });

      holderRepo.findOne.mockResolvedValue(holder);
      accountRepo.findOne.mockResolvedValue(existingAccount);

      await expect(service.createByCpf(createAccountDto)).rejects.toThrow(
        ConflictException,
      );
      expect(holderRepo.findOne).toHaveBeenCalledWith({
        where: { cpf: createAccountDto.cpf },
      });
      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { holder: { id: holder.id } },
      });
      expect(accountRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findByCpfOrAccount', () => {
    it('should find account by CPF successfully', async () => {
      const cpf = '12345678901';
      const holder = makeHolder({ cpf });
      const account = makeAccount({
        holder,
        accountNumber: '123456',
        agency: '0001',
        balance: 1000,
        status: AccountStatus.ACTIVE,
      });

      holderRepo.findOne.mockResolvedValue(holder);
      accountRepo.findOne.mockResolvedValue(account);

      const result = await service.findByCpfOrAccount(cpf);

      expect(holderRepo.findOne).toHaveBeenCalledWith({ where: { cpf } });
      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { holder: { id: holder.id } },
      });
      expect(result).toEqual({
        accountNumber: account.accountNumber,
        agency: account.agency,
        balance: account.balance,
        status: account.status,
      });
    });

    it('should find account by account number successfully', async () => {
      const accountNumber = '123456';
      const account = makeAccount({
        accountNumber,
        agency: '0001',
        balance: 1000,
        status: AccountStatus.ACTIVE,
      });

      accountRepo.findOne.mockResolvedValue(account);

      const result = await service.findByCpfOrAccount(accountNumber);

      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber },
      });
      expect(result).toEqual({
        accountNumber: account.accountNumber,
        agency: account.agency,
        balance: account.balance,
        status: account.status,
      });
    });

    it('should throw NotFoundException when account not found by CPF', async () => {
      const cpf = '12345678901';
      holderRepo.findOne.mockResolvedValue(null);

      await expect(service.findByCpfOrAccount(cpf)).rejects.toThrow(
        NotFoundException,
      );
      expect(holderRepo.findOne).toHaveBeenCalledWith({ where: { cpf } });
    });

    it('should throw NotFoundException when account not found by account number', async () => {
      const accountNumber = '123456';
      accountRepo.findOne.mockResolvedValue(null);

      await expect(service.findByCpfOrAccount(accountNumber)).rejects.toThrow(
        NotFoundException,
      );
      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber },
      });
    });
  });

  describe('updateAccountStatus', () => {
    it('should update account status successfully', async () => {
      const accountNumber = '123456';
      const updateStatusDto = makeUpdateStatusDto(AccountStatus.BLOCKED);
      const account = makeAccount({
        accountNumber,
        status: AccountStatus.ACTIVE,
      });

      accountRepo.findOne.mockResolvedValue(account);
      accountRepo.save.mockResolvedValue({
        ...account,
        status: AccountStatus.BLOCKED,
      });

      await service.updateAccountStatus(accountNumber, updateStatusDto);

      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber },
      });
      expect(accountRepo.save).toHaveBeenCalledWith({
        ...account,
        status: AccountStatus.BLOCKED,
      });
    });

    it('should throw NotFoundException when account not found', async () => {
      const accountNumber = '123456';
      const updateStatusDto = makeUpdateStatusDto(AccountStatus.BLOCKED);
      accountRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateAccountStatus(accountNumber, updateStatusDto),
      ).rejects.toThrow(NotFoundException);
      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber },
      });
      expect(accountRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when trying to block a closed account', async () => {
      const accountNumber = '123456';
      const updateStatusDto = makeUpdateStatusDto(AccountStatus.BLOCKED);
      const account = makeAccount({
        accountNumber,
        status: AccountStatus.CLOSED,
      });

      accountRepo.findOne.mockResolvedValue(account);

      await expect(
        service.updateAccountStatus(accountNumber, updateStatusDto),
      ).rejects.toThrow(ConflictException);
      expect(accountRepo.findOne).toHaveBeenCalledWith({
        where: { accountNumber },
      });
      expect(accountRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('generateAccountNumber', () => {
    it('should generate a 6-digit account number', async () => {
      const result = await service.generateAccountNumber();

      expect(result).toMatch(/^\d{6}$/);
    });
  });
});
