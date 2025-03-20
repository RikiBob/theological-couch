import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { CustomLoggerService } from './logger/logger.service';
import { AllExceptionsFilter } from './middlewares/exception-filter';

dotenv.config();

async function bootstrap() {
  const PORT = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
    credentials: true,
  });

  const logger = app.get(CustomLoggerService);

  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
bootstrap();
