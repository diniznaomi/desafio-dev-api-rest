import { CreateHolderDto } from '../dtos/create-holder.dto';
import { Holder } from '../entities/holder.entity';

export interface IHoldersService {
  create(holder: CreateHolderDto): Promise<{ id: string }>;
  delete(id: string): Promise<void>;
}
