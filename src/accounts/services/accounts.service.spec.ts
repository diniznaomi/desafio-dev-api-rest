import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';
import { Repository } from 'typeorm';
import { Holder } from '../../holders/entities/holder.entity';

describe('AccountsService', () => {
  let service: AccountsService;

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<Account>>;

  const mockRepoHolder = {
    findOne: jest.fn(),
  } as unknown as jest.Mocked<Repository<Holder>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(Holder),
          useValue: mockRepoHolder,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
