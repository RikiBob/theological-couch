import { Module } from '@nestjs/common';
import { EditionService } from './edition.service';
import { EditionController } from './edition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditionEntity } from '../entities/edition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EditionEntity])],
  controllers: [EditionController],
  providers: [EditionService],
  exports: [EditionService],
})
export class EditionModule {}
