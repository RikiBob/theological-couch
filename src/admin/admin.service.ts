import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditionEntity } from '../entities/edition.entity';
import { Repository } from 'typeorm';
import { CreateEditionDto } from './dtoes/create-edition.dto';
import { QuestionEntity } from '../entities/question.entity';
import { TelegramService } from '../telegram/telegram.service';
import { CreateAnswerDto } from './dtoes/create-answer.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(EditionEntity)
    private readonly editionRepository: Repository<EditionEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
    private readonly telegramService: TelegramService,
    private readonly emailService: EmailService,
  ) {}

  async createEdition(data: CreateEditionDto): Promise<EditionEntity> {
    try {
      data.url_video = data.url_video.split('&')[0];
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
    const edition = await this.editionRepository.findOneBy({ url_video: url });
    if (!edition) {
      throw new BadRequestException('Video not found.');
    }

    return edition;
  }

  async createAnswer(data: CreateAnswerDto, questionId: number): Promise<void> {
    try {
      const { url, question_summary } = data;
      const question = await this.checkQuestionById(questionId);
      const parseUrl = url.split('&t=')[0];
      const edition = await this.checkEditionByUrl(parseUrl);

      await this.questionRepository.update(
        { id: questionId },
        {
          url_answer: url,
          edition_id: edition.id,
          question_summary: question_summary,
        },
      );

      const replacements = {
        video_url: url,
        question_text: question.question_text,
      };

      if (!question.email && !question.telegram_id) {
        return;
      }

      if (question.telegram_id) {
        await this.telegramService.sendMessage(
          question.telegram_id,
          replacements,
        );
      } else {
        await this.emailService.sendEmail({
          to: question.email,
          subject: 'Відповідь на питання',
          replacements,
        });
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async checkEditionById(id: number): Promise<EditionEntity> {
    const edition = await this.editionRepository.findOneBy({ id: id });

    if (!edition) {
      throw new BadRequestException('Edition not found.');
    }

    return edition;
  }

  async deleteEditionById(id: number): Promise<void> {
    try {
      const edition = await this.checkEditionById(id);
      await this.editionRepository.delete(edition.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteQuestionById(id: number): Promise<void> {
    try {
      const question = await this.checkQuestionById(id);
      await this.questionRepository.delete(question.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async rollbackAnswerById(id: number): Promise<void> {
    try {
      const question = await this.checkQuestionById(id);
      await this.questionRepository.update(
        { id: question.id },
        {
          url_answer: null,
        },
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
