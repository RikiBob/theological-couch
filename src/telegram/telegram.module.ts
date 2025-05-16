import { forwardRef, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { QuestionService } from '../question/question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from '../entities/question.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CustomLoggerService } from '../logger/logger.service';
import { QuestionModule } from '../question/question.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionEntity]),
    CacheModule.registerAsync({
      useFactory: async () => ({
        max: 100,
        ttl: 0,
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        username: 'default',
        password: process.env.REDIS_PASSWORD,
        tls: {},
      }),
    }),
    forwardRef(() => QuestionModule),
    LoggerModule,
  ],
  controllers: [],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
