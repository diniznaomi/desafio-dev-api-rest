import { CreateAccountDto } from '../../../accounts/dtos/create-account.dto';
import { faker } from '@faker-js/faker';

export function makeCreateAccountDto(
  override: Partial<CreateAccountDto> = {},
): CreateAccountDto {
  return {
    cpf: faker.string.numeric(11),
    ...override,
  };
}
