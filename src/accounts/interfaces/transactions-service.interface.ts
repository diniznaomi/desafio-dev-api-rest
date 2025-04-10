import { DepositDto } from '../dtos/deposit.dto';
import { WithdrawDto } from '../dtos/withdraw.dto';
import { TransactionResponse } from '../responses/transaction.response';
import { TransactionFilterDto } from '../dtos/transaction-filter.dto';

export interface ITransactionsService {
  deposit(depositData: DepositDto): Promise<TransactionResponse>;
  withdraw(withdrawData: WithdrawDto): Promise<TransactionResponse>;
  getAccountTransactions(
    accountNumber: string,
    filter?: TransactionFilterDto,
  ): Promise<{ total: number; history: TransactionResponse[] }>;
}
