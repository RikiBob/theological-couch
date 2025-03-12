import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../entities/admin.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import * as dotenv from 'dotenv';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtService } from '@nestjs/jwt';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminEntity]),
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
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtStrategy, JwtService],
})
export class AuthModule {}
