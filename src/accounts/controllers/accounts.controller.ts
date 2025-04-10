import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Inject,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IAccountsService } from '../interfaces/accounts-service.interface';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { AccountResponseDto } from '../responses/account.response';
import { UpdateStatusDto } from '../dtos/update-status.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Accounts')
@Controller('accounts')
@ApiBearerAuth()
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(
    @Inject('IAccountsService')
    private readonly accountsService: IAccountsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a digital account using holder CPF' })
  @ApiResponse({ status: 201, description: 'Account successfully created' })
  @ApiResponse({ status: 404, description: 'Holder not found' })
  @ApiResponse({ status: 409, description: 'Account already exists' })
  async create(@Body() accountData: CreateAccountDto): Promise<void> {
    try {
      this.logger.log(`Creating account for CPF: ${accountData.cpf}`);
      await this.accountsService.createByCpf(accountData);
      this.logger.log(
        `Account successfully created for CPF: ${accountData.cpf}`,
      );
    } catch (error) {
      this.logger.error(
        `Error creating account for CPF ${accountData.cpf}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':value')
  @ApiOperation({ summary: 'Find account by CPF or account number' })
  @ApiParam({
    name: 'value',
    description: 'CPF (11 digits) or account number',
    example: '12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Account found successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  async findByCpfOrAccount(
    @Param('value') value: string,
  ): Promise<AccountResponseDto> {
    try {
      this.logger.log(`Searching account with parameter: ${value}`);
      const result = await this.accountsService.findByCpfOrAccount(value);
      this.logger.log(`Account found for parameter: ${value}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error finding account with parameter ${value}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':accountNumber/status')
  @ApiOperation({ summary: 'Update account status (block, active, close)' })
  @ApiParam({
    name: 'accountNumber',
    description: 'Account number',
    example: '123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Account status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Invalid status transition',
  })
  async updateAccountStatus(
    @Param('accountNumber') accountNumber: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(
        `Updating account ${accountNumber} status to ${updateStatusDto.status}`,
      );
      await this.accountsService.updateAccountStatus(
        accountNumber,
        updateStatusDto,
      );
      this.logger.log(
        `Account ${accountNumber} status updated to ${updateStatusDto.status}`,
      );

      return {
        message: `Account ${updateStatusDto.status.toLocaleLowerCase()} successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error updating account ${accountNumber} status to ${updateStatusDto.status}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
