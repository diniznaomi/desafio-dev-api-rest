import { DepositDto } from '../../../accounts/dtos/deposit.dto';
import { faker } from '@faker-js/faker';

export function makeDepositDto(override: Partial<DepositDto> = {}): DepositDto {
  return {
    accountNumber: faker.string.numeric(6),
    amount: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
    ...override,
  };
}
