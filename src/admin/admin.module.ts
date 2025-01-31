import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditionEntity } from '../entities/edition.entity';
import { QuestionEntity } from '../entities/question.entity';
import { EmailService } from '../email/email.service';
import { EMAIL_SERVICE } from '../email/emaile.contacts';
import { TelegramService } from '../telegram/telegram.service';
import { QuestionService } from '../question/question.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CustomLoggerService } from '../logger/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EditionEntity, QuestionEntity]),
    CacheModule.register(),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: EMAIL_SERVICE,
      useClass: EmailService,
    },
    TelegramService,
    QuestionService,
    CustomLoggerService,
  ],
})
export class AdminModule {}
