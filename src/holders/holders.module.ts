import { Module } from '@nestjs/common';
import { HoldersController } from './holders.controller';
import { HoldersService } from './service/holders.service';

@Module({
  controllers: [HoldersController],
  providers: [HoldersService],
})
export class HoldersModule {}
