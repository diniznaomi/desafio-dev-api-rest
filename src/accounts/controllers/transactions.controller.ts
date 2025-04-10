import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Inject,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ITransactionsService } from '../interfaces/transactions-service.interface';
import { DepositDto } from '../dtos/deposit.dto';
import { WithdrawDto } from '../dtos/withdraw.dto';
import { TransactionResponse } from '../responses/transaction.response';
import { TransactionFilterDto } from '../dtos/transaction-filter.dto';
import { TransactionType } from '../enums/transaction-type.enum';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('transactions')
@Controller('accounts/transactions')
@ApiBearerAuth()
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    @Inject('ITransactionsService')
    private readonly transactionsService: ITransactionsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('deposit')
  @ApiOperation({ summary: 'Make a deposit to an account' })
  @ApiResponse({
    status: 201,
    description: 'Deposit successful',
    type: TransactionResponse,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Account is not active' })
  async deposit(@Body() depositDto: DepositDto): Promise<TransactionResponse> {
    try {
      this.logger.log(
        `Processing deposit of ${depositDto.amount} to account ${depositDto.accountNumber}`,
      );
      const result = await this.transactionsService.deposit(depositDto);
      this.logger.log(
        `Deposit of ${depositDto.amount} to account ${depositDto.accountNumber} completed successfully`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error processing deposit to account ${depositDto.accountNumber}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('withdraw')
  @ApiOperation({ summary: 'Make a withdrawal from an account' })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal successful',
    type: TransactionResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient funds or daily limit exceeded',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Account is not active' })
  async withdraw(
    @Body() withdrawDto: WithdrawDto,
  ): Promise<TransactionResponse> {
    try {
      this.logger.log(
        `Processing withdrawal of ${withdrawDto.amount} from account ${withdrawDto.accountNumber}`,
      );
      const result = await this.transactionsService.withdraw(withdrawDto);
      this.logger.log(
        `Withdrawal of ${withdrawDto.amount} from account ${withdrawDto.accountNumber} completed successfully`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error processing withdrawal from account ${withdrawDto.accountNumber}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':accountNumber')
  @ApiOperation({
    summary: 'Get account transactions with filtering options',
  })
  @ApiParam({
    name: 'accountNumber',
    description: 'Account number',
    example: '123456',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter transactions from this date (YYYY-MM-DD)',
    type: Date,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter transactions until this date (YYYY-MM-DD)',
    type: Date,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by transaction type',
    enum: TransactionType,
  })
  @ApiResponse({
    status: 200,
    description: 'List of transactions (max 6 months of history)',
    type: [TransactionResponse],
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getTransactions(
    @Param('accountNumber') accountNumber: string,
    @Query() filter: TransactionFilterDto,
  ): Promise<{ total: number; history: TransactionResponse[] }> {
    try {
      this.logger.log(
        `Retrieving transactions for account ${accountNumber} with filters: ${JSON.stringify(
          filter,
        )}`,
      );
      const result = await this.transactionsService.getAccountTransactions(
        accountNumber,
        filter,
      );
      this.logger.log(
        `Retrieved ${result.total} transactions for account ${accountNumber}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error retrieving transactions for account ${accountNumber}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
