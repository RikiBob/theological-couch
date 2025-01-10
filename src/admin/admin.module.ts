import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { EditionEntity } from "../entities/edition.entity";
import { QuestionEntity } from "../entities/question.entity";
import { EmailService } from "../email/email.service";
import { EMAIL_SERVICE } from "../email/emaile.contacts";


@Module({
  imports: [
    TypeOrmModule.forFeature([EditionEntity, QuestionEntity]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
    provide: EMAIL_SERVICE,
    useClass: EmailService,
  },],
})
export class AdminModule {}
