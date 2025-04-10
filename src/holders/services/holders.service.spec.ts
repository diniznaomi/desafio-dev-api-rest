import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HoldersService } from './holders.service';
import { Holder } from '../entities/holder.entity';
import { BadRequestException } from '@nestjs/common';
import { makeCreateHolderDto, makeHolder } from '../../test/factories';
import { IHoldersService } from '../interfaces/holders-service.interface';

describe('HoldersService', () => {
  let service: IHoldersService;
  let repo: jest.Mocked<Repository<Holder>>;

  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Repository<Holder>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoldersService,
        {
          provide: getRepositoryToken(Holder),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<HoldersService>(HoldersService);
    repo = module.get(getRepositoryToken(Holder));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new holder when CPF is not registered', async () => {
      const createHolderDto = makeCreateHolderDto();
      const createdHolder = makeHolder({ ...createHolderDto });
      const response = { id: createdHolder.id };

      repo.findOne.mockResolvedValue(null);
      repo.save.mockResolvedValue(createdHolder);

      const result = await service.create(createHolderDto);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { cpf: createHolderDto.cpf },
      });
      expect(repo.save).toHaveBeenCalledWith(createHolderDto);
      expect(result).toEqual(response);
    });

    it('should throw BadRequestException if CPF is already registered', async () => {
      const createHolderDto = makeCreateHolderDto();
      const existingHolder = makeHolder({ cpf: createHolderDto.cpf });

      repo.findOne.mockResolvedValue(existingHolder);

      await expect(service.create(createHolderDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { cpf: createHolderDto.cpf },
      });
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete the holder by id', async () => {
      const holderId = 'some-uuid';

      repo.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.delete(holderId);

      expect(repo.delete).toHaveBeenCalledWith(holderId);
    });
  });
});
