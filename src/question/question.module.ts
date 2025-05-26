import { forwardRef, Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from '../entities/question.entity';
import { LoggerModule } from '../logger/logger.module';
import { TelegramModule } from '../telegram/telegram.module';
import { EditionModule } from '../edition/edition.module';
import { EditionEntity } from '../entities/edition.entity';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionEntity, EditionEntity]),
    forwardRef(() => TelegramModule),
    LoggerModule,
    EditionModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService, EmailService],
  exports: [QuestionService],
})
export class QuestionModule {}
