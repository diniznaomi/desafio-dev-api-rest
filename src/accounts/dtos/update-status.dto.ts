import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '../enums/account-status.enum';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(AccountStatus)
  @ApiProperty({
    description: 'New account status',
    enum: AccountStatus,
    example: AccountStatus.BLOCKED,
  })
  status: AccountStatus;
}
