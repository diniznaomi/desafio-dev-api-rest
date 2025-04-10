import { WithdrawDto } from '../../../accounts/dtos/withdraw.dto';
import { faker } from '@faker-js/faker';

export function makeWithdrawDto(
  override: Partial<WithdrawDto> = {},
): WithdrawDto {
  return {
    accountNumber: faker.string.numeric(6),
    amount: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
    ...override,
  };
}
