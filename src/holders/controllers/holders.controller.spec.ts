import { Test, TestingModule } from '@nestjs/testing';
import { HoldersController } from './holders.controller';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { makeCreateHolderDto, makeHolder } from '../../test/factories';
import { IHoldersService } from '../interfaces/holders-service.interface';

describe('HoldersController', () => {
  let controller: HoldersController;
  let service: IHoldersService;

  const mockHoldersService = {
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HoldersController],
      providers: [
        {
          provide: 'IHoldersService',
          useValue: mockHoldersService,
        },
      ],
    }).compile();

    controller = module.get<HoldersController>(HoldersController);
    service = module.get<IHoldersService>('IHoldersService');

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a holder successfully', async () => {
      const createHolderDto = makeCreateHolderDto();
      const createdHolder = makeHolder({
        fullName: createHolderDto.fullName,
        cpf: createHolderDto.cpf,
      });

      mockHoldersService.create.mockResolvedValue(createdHolder);

      await controller.create(createHolderDto);

      expect(service.create).toHaveBeenCalledWith(createHolderDto);
    });

    it('should propagate BadRequestException from service', async () => {
      const createHolderDto = makeCreateHolderDto();
      mockHoldersService.create.mockRejectedValue(
        new BadRequestException('This CPF is already registered'),
      );

      await expect(controller.create(createHolderDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(service.create).toHaveBeenCalledWith(createHolderDto);
    });
  });

  describe('delete', () => {
    it('should delete a holder successfully', async () => {
      const holderId = 'some-uuid';
      mockHoldersService.delete.mockResolvedValue(undefined);

      await controller.delete(holderId);

      expect(service.delete).toHaveBeenCalledWith(holderId);
    });

    it('should propagate errors from service', async () => {
      const holderId = 'invalid-uuid';
      mockHoldersService.delete.mockRejectedValue(
        new BadRequestException('Invalid holder ID'),
      );

      await expect(controller.delete(holderId)).rejects.toThrow(
        BadRequestException,
      );

      expect(service.delete).toHaveBeenCalledWith(holderId);
    });
  });
});
