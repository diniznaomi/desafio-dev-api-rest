import { TransactionFilterDto } from '../../../accounts/dtos/transaction-filter.dto';
import { TransactionType } from '../../../accounts/enums/transaction-type.enum';
import { faker } from '@faker-js/faker';

export function makeTransactionFilterDto(
  override: Partial<TransactionFilterDto> = {},
): TransactionFilterDto {
  return {
    startDate: faker.date.past(),
    endDate: faker.date.recent(),
    type: faker.helpers.arrayElement([
      TransactionType.DEPOSIT,
      TransactionType.WITHDRAWAL,
    ]),
    ...override,
  };
}
