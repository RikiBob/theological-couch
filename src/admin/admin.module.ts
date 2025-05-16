import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditionEntity } from '../entities/edition.entity';
import { QuestionEntity } from '../entities/question.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailService } from '../email/email.service';
import { QuestionModule } from '../question/question.module';
import { LoggerModule } from '../logger/logger.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EditionEntity, QuestionEntity]),
    CacheModule.register(),
    TelegramModule,
    QuestionModule,
    LoggerModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, EmailService],
})
export class AdminModule {}
