import { CreateAccountResponse } from '../../../accounts/responses/create-account.response';
import { faker } from '@faker-js/faker';

export function makeCreateAccountResponse(
  override: Partial<CreateAccountResponse> = {},
): CreateAccountResponse {
  return {
    id: faker.string.uuid(),
    accountNumber: faker.string.numeric(6),
    agency: '0001',
    ...override,
  };
}
