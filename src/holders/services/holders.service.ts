import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateHolderDto } from '../dtos/create-holder.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holder } from '../entities/holder.entity';
import { IHoldersService } from '../interfaces/holders-service.interface';

@Injectable()
export class HoldersService implements IHoldersService {
  private readonly logger = new Logger(HoldersService.name);

  constructor(
    @InjectRepository(Holder)
    private readonly repo: Repository<Holder>,
  ) {}

  async create(holder: CreateHolderDto) {
    try {
      this.logger.log(`Creating holder with CPF: ${holder.cpf}`);

      const exists = await this.repo.findOne({ where: { cpf: holder.cpf } });
      if (exists) {
        this.logger.warn(`CPF already registered: ${holder.cpf}`);
        throw new BadRequestException('This CPF is already registered');
      }

      const newHolder = await this.repo.save(holder);
      this.logger.log(`Holder created successfully with ID: ${newHolder.id}`);

      return { id: newHolder.id };
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        this.logger.error(
          `Error creating holder with CPF ${holder.cpf}: ${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      this.logger.log(`Deleting holder with ID: ${id}`);

      const holder = await this.repo.findOne({ where: { id } });
      if (!holder) {
        this.logger.warn(`Holder not found: ${id}`);
        throw new ConflictException('Holder not found');
      }

      await this.repo.delete(id);
      this.logger.log(`Holder deleted successfully: ${id}`);
    } catch (error) {
      if (!(error instanceof ConflictException)) {
        this.logger.error(
          `Error deleting holder ${id}: ${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }
}
