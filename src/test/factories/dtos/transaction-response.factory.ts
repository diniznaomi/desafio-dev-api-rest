import { TransactionResponse } from '../../../accounts/responses/transaction.response';
import { TransactionType } from '../../../accounts/enums/transaction-type.enum';
import { faker } from '@faker-js/faker';

export function makeTransactionResponse(
  override: Partial<TransactionResponse> = {},
): TransactionResponse {
  return {
    transactionId: faker.string.uuid(),
    accountNumber: faker.string.numeric(6),
    amount: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
    type: faker.helpers.arrayElement([
      TransactionType.DEPOSIT,
      TransactionType.WITHDRAWAL,
    ]),
    createdAt: faker.date.recent(),
    newBalance: faker.number.float({ min: 0, max: 5000, fractionDigits: 2 }),
    ...override,
  };
}
