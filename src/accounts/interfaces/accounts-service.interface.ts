import { CreateAccountDto } from '../dtos/create-account.dto';
import { AccountResponseDto } from '../responses/account.response';
import { UpdateStatusDto } from '../dtos/update-status.dto';
import { Account } from '../entities/account.entity';

export interface IAccountsService {
  createByCpf(accountData: CreateAccountDto): Promise<Account>;
  findByCpfOrAccount(value: string): Promise<AccountResponseDto>;
  findByCpf(cpf: string): Promise<Account | null>;
  findByAccountNumber(accountNumber: string): Promise<Account | null>;
  generateAccountNumber(): Promise<string>;
  updateAccountStatus(
    accountNumber: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<void>;
}
