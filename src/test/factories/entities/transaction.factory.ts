import { Transaction } from '../../../accounts/entities/transaction.entity';
import { TransactionType } from '../../../accounts/enums/transaction-type.enum';
import { faker } from '@faker-js/faker';
import { makeAccount } from './account.factory';

export function makeTransaction(
  override: Partial<Transaction> = {},
): Transaction {
  const account = override.account || makeAccount();
  const accountNumber = override.accountNumber || account.accountNumber;

  const transaction = {
    id: faker.string.uuid(),
    accountNumber,
    amount: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
    type: faker.helpers.arrayElement([
      TransactionType.DEPOSIT,
      TransactionType.WITHDRAWAL,
    ]),
    createdAt: faker.date.recent(),
    newBalance: faker.number.float({ min: 0, max: 5000, fractionDigits: 2 }),
    account,
    ...override,
  } as Transaction;

  return transaction;
}

export function makeTransactions(
  count: number = 2,
  overrideAll: Partial<Transaction> = {},
  overrideEach?: (index: number) => Partial<Transaction>,
): Transaction[] {
  return Array.from({ length: count }, (_, index) => {
    const individualOverride = overrideEach ? overrideEach(index) : {};
    return makeTransaction({
      ...overrideAll,
      ...individualOverride,
    });
  });
}
