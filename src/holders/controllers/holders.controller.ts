import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IHoldersService } from '../interfaces/holders-service.interface';
import { Holder } from '../entities/holder.entity';
import { CreateHolderDto } from '../dtos/create-holder.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Holders')
@Controller('holders')
@ApiBearerAuth()
export class HoldersController {
  private readonly logger = new Logger(HoldersController.name);

  constructor(
    @Inject('IHoldersService')
    private readonly holdersService: IHoldersService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a holder with name and CPF' })
  @ApiCreatedResponse({
    description: 'Holder successfully created',
    type: Holder,
  })
  @ApiBadRequestResponse({
    description: 'CPF already registered or invalid input',
  })
  async create(@Body() holder: CreateHolderDto): Promise<{ id: string }> {
    try {
      this.logger.log(`Creating holder with CPF ${holder.cpf}`);
      const result = await this.holdersService.create(holder);
      this.logger.log(`Holder created successfully with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating holder: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a holder by ID' })
  @ApiParam({ name: 'id', description: 'ID of the holder to delete' })
  @ApiNoContentResponse({ description: 'Holder successfully deleted' })
  @ApiBadRequestResponse({ description: 'Invalid holder ID' })
  async delete(@Param('id') id: string): Promise<void> {
    try {
      this.logger.log(`Deleting holder with ID: ${id}`);
      await this.holdersService.delete(id);
      this.logger.log(`Holder with ID: ${id} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting holder ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
