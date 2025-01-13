import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EditionEntity } from "../entities/edition.entity";
import { Repository } from "typeorm";
import { CreateEditionDto } from "./dtoes/create-edition.dto";
import { QuestionEntity } from "../entities/question.entity";
import * as dotenv from "dotenv";
import { IEmailService } from "../email/email.interface";
import { EMAIL_SERVICE } from "../email/emaile.contacts";
import { EmailResponseDto } from "../email/dtoes/email-response.dto";

dotenv.config();

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(EditionEntity)
    private readonly editionRepository: Repository<EditionEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}

  async createEdition(data: CreateEditionDto): Promise<EditionEntity> {
    if(!data.name || !data.url_video) {
      throw new BadRequestException('The name or url field is empty');
    }

    try {
      const edition = this.editionRepository.create(data);
      return await this.editionRepository.save(edition);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async checkQuestionById(id: number): Promise<QuestionEntity> {
    const question = await this.questionRepository.findOneBy({ id: id });

    if (!question) {
      throw new BadRequestException('Question not found.');
    }

    return question;
  }

  private async checkEditionByUrl(url: string): Promise<EditionEntity> {
    const edition = await this.editionRepository.findOneBy({url_video: url});

    if (!edition) {
      throw new BadRequestException('Video not found.');
    }

    return edition;
  }

  async createResponse(url: string, questionId: number): Promise<EmailResponseDto> {
    if(!url || !questionId) {
      throw new BadRequestException('URL or question ID missing');
    }

    try {
      const question = await this.checkQuestionById(questionId);
      const parseUrl = url.split("&t=")[0];
      const edition = await this.checkEditionByUrl(parseUrl);

      await this.questionRepository.update(
        { id: questionId },
        { url_response: url, edition_id: edition.id });

      const replacements = {
        video_url: url,
        question_text: question.question_text
      };
      const mailOptions = {
        to: question.email,
        subject: "Answer to Your Question",
        replacements
      };

      return await this.emailService.sendEmail(mailOptions);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async checkEditionById(id: number): Promise<EditionEntity> {
    const question = await this.editionRepository.findOneBy({ id: id });

    if (!question) {
      throw new BadRequestException('Edition not found.');
    }

    return question;
  }

  async deleteEdition(id: string): Promise<void> {
    try {
      const edition = await this.checkEditionById(+id);
      await this.editionRepository.delete(edition.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
