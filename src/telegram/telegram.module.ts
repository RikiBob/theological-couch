import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { QuestionService } from '../question/question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from '../entities/question.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import * as dotenv from 'dotenv';
import { CustomLoggerService } from '../logger/logger.service';

dotenv.config();

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
  ],
  controllers: [],
  providers: [TelegramService, QuestionService, CustomLoggerService],
  exports: [TelegramService],
})
export class TelegramModule {}
