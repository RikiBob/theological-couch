import { MiddlewareConsumer, Module, NestModule, OnModuleInit } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as dotenv from "dotenv";
import { AdminEntity } from "./entities/admin.entity";
import { EditionEntity } from "./entities/edition.entity";
import { QuestionEntity } from "./entities/question.entity";
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { QuestionModule } from './question/question.module';
import { LoggerModule } from './logger/logger.module';
import { CustomLoggerService } from "./logger/logger.service";
import { LoggerMiddleware } from "./middlewares/logger.middleware";

dotenv.config();

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [AdminEntity, EditionEntity, QuestionEntity],
    synchronize: true,
  }),
    TypeOrmModule.forFeature([AdminEntity]),
    AuthModule,
    AdminModule,
    QuestionModule,
    LoggerModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit, NestModule {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly customLoggerService: CustomLoggerService,
  ) {}

  //Створюємо екземпляр Admin при ініціалізації модулю
  async onModuleInit() {
    const admin = await this.adminRepository.findOneBy({ login: process.env.ADMIN_LOGIN });
    if (!admin) {
      const admin = this.adminRepository.create({
        login: process.env.ADMIN_LOGIN,
        password: process.env.ADMIN_PASSWORD,
      });
      await this.adminRepository.save(admin);
    }
  }

  // Реєстрація middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
