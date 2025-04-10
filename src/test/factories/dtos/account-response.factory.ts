import { AccountStatus } from '../../../accounts/enums/account-status.enum';
import { AccountResponseDto } from '../../../accounts/responses/account.response';
import { faker } from '@faker-js/faker';

export function makeAccountResponseDto(
  override: Partial<AccountResponseDto> = {},
): AccountResponseDto {
  return {
    accountNumber: faker.string.numeric(6),
    agency: '0001',
    balance: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
    ...override,
    status: AccountStatus.ACTIVE,
  };
}
