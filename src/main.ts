import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from "@nestjs/common";
import { CustomLoggerService } from "./logger/logger.service";
import { AllExceptionsFilter } from "./logger/exception-filter";

dotenv.config();

async function bootstrap() {
  const PORT = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);
  const logger = app.get(CustomLoggerService);

  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());


  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
bootstrap();
