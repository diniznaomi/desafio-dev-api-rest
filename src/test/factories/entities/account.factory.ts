import { Account } from '../../../accounts/entities/account.entity';
import { AccountStatus } from '../../../accounts/enums/account-status.enum';
import { faker } from '@faker-js/faker';
import { makeHolder } from './holder.factory';

export function makeAccount(override: Partial<Account> = {}): Account {
  const account = new Account();

  account.id = faker.string.uuid();
  account.accountNumber = faker.string.numeric(6);
  account.agency = '0001';
  account.balance = faker.number.float({
    min: 0,
    max: 10000,
    fractionDigits: 2,
  });
  account.status = AccountStatus.ACTIVE;
  account.holder = override.holder || makeHolder();
  account.transactions = [];

  return Object.assign(account, override);
}
