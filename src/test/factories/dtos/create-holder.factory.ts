import { CreateHolderDto } from '../../../holders/dtos/create-holder.dto';
import { faker } from '@faker-js/faker';

export function makeCreateHolderDto(
  override: Partial<CreateHolderDto> = {},
): CreateHolderDto {
  return {
    fullName: faker.person.fullName(),
    cpf: faker.string.numeric(11),
    ...override,
  };
}
