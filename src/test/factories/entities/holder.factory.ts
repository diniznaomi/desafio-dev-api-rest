import { Holder } from '../../../holders/entities/holder.entity';
import { faker } from '@faker-js/faker';

export function makeHolder(override: Partial<Holder> = {}): Holder {
  const holder = new Holder();

  holder.id = faker.string.uuid();
  holder.fullName = faker.person.fullName();
  holder.cpf = faker.string.numeric(11);
  holder.accounts = [];

  return Object.assign(holder, override);
}
