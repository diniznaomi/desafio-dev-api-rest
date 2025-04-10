import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holder } from './entities/holder.entity';
import { HoldersController } from './controllers/holders.controller';
import { HoldersService } from './services/holders.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Holder]), AuthModule],
  controllers: [HoldersController],
  providers: [
    {
      provide: 'IHoldersService',
      useClass: HoldersService,
    },
  ],
  exports: ['IHoldersService'],
})
export class HoldersModule {}
