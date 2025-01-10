import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { EditionEntity } from "../entities/edition.entity";
import { QuestionEntity } from "../entities/question.entity";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([EditionEntity, QuestionEntity]),
    EmailModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
