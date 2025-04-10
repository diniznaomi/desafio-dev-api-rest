import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { Holder } from '../../holders/entities/holder.entity';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { AccountStatus } from '../enums/account-status.enum';
import { AccountResponseDto } from '../responses/account.response';
import { UpdateStatusDto } from '../dtos/update-status.dto';
import { IAccountsService } from '../interfaces/accounts-service.interface';

@Injectable()
export class AccountsService implements IAccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Holder)
    private readonly holderRepo: Repository<Holder>,
  ) {}

  async createByCpf(
    accountData: CreateAccountDto,
  ): Promise<{ id: string; accountNumber: string; agency: string }> {
    this.logger.log(`Attempting to create account`);

    const holder = await this.holderRepo.findOne({
      where: { cpf: accountData.cpf },
    });

    if (!holder) {
      this.logger.warn(`Holder not found`);
      throw new NotFoundException('Holder not found for provided CPF');
    }

    const existingAccount = await this.accountRepo.findOne({
      where: { holder: { id: holder.id } },
    });

    if (existingAccount) {
      this.logger.log(`Found existing account for holder`);
      return this.handleExistingAccount(existingAccount);
    }

    this.logger.log(`Creating new account`);
    const accountNumber = await this.generateAccountNumber();
    this.logger.log(`Generated account number: ${accountNumber}`);

    const account = this.accountRepo.create({
      holder,
      accountNumber,
      agency: process.env.AGENCY_NUMBER,
      balance: 0.0,
      status: AccountStatus.ACTIVE,
    });

    const savedAccount = await this.accountRepo.save(account);
    this.logger.log(
      `Account created successfully with number: ${savedAccount.accountNumber}`,
    );

    return {
      id: savedAccount.id,
      accountNumber: savedAccount.accountNumber,
      agency: savedAccount.agency,
    };
  }

  private async handleExistingAccount(
    account: Account,
  ): Promise<{ id: string; accountNumber: string; agency: string }> {
    if (account.status === AccountStatus.CLOSED) {
      this.logger.log(
        `Reactivating closed account number: ${account.accountNumber}`,
      );
      account.status = AccountStatus.ACTIVE;
      const savedAccount = await this.accountRepo.save(account);
      return {
        id: savedAccount.id,
        accountNumber: savedAccount.accountNumber,
        agency: savedAccount.agency,
      };
    } else {
      this.logger.warn(
        `Account already exists and is active for holder ID: ${account.holder.id}`,
      );
      throw new ConflictException('Account already exists for this holder');
    }
  }

  async findByCpfOrAccount(value: string): Promise<AccountResponseDto> {
    this.logger.log(`Searching account with value: ${value}`);

    const isCpf = /^\d{11}$/.test(value);
    this.logger.debug(
      `Value identified as ${isCpf ? 'CPF' : 'account number'}`,
    );

    const account = isCpf
      ? await this.findByCpf(value)
      : await this.findByAccountNumber(value);

    if (!account) {
      this.logger.warn(
        `No account found for ${isCpf ? 'CPF' : 'account number'}: ${value}`,
      );
      throw new NotFoundException('Account not found');
    }

    this.logger.log(
      `Account found with account number: ${account.accountNumber}`,
    );
    return {
      accountNumber: account.accountNumber,
      agency: account.agency,
      balance: account.balance,
      status: account.status,
    };
  }

  async findByCpf(cpf: string) {
    const holder = await this.holderRepo.findOne({ where: { cpf } });
    if (!holder) return null;
    return this.accountRepo.findOne({ where: { holder: { id: holder.id } } });
  }

  async findByAccountNumber(accountNumber: string) {
    return this.accountRepo.findOne({ where: { accountNumber } });
  }

  async generateAccountNumber(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async updateAccountStatus(
    accountNumber: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<void> {
    this.logger.log(
      `Updating status for account: ${accountNumber} to ${updateStatusDto.status}`,
    );

    const account = await this.accountRepo.findOne({
      where: { accountNumber },
    });

    if (!account) {
      this.logger.warn(`Account not found: ${accountNumber}`);
      throw new NotFoundException('Account not found');
    }

    if (
      account.status === AccountStatus.CLOSED &&
      updateStatusDto.status === AccountStatus.BLOCKED
    ) {
      this.logger.warn(
        `Invalid status transition from CLOSED to BLOCKED for account: ${accountNumber}`,
      );
      throw new ConflictException('Closed accounts cannot be blocked');
    }

    account.status = updateStatusDto.status;
    await this.accountRepo.save(account);
    this.logger.log(
      `Account ${accountNumber} status updated to ${updateStatusDto.status}`,
    );
  }
}
