import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from '../entities/question.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateQuestionDto } from './dtoes/create-question.dto';
import { PaginateQuestionsDto } from './dtoes/paginate-questions.dto';
import { TelegramService } from '../telegram/telegram.service';
import { CreateAnswerDto } from './dtoes/create-answer.dto';
import { EditionEntity } from '../entities/edition.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class QuestionService {
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
    @InjectRepository(EditionEntity)
    private readonly editionRepository: Repository<EditionEntity>,
    private readonly emailService: EmailService,
  ) {}

  async createQuestion(data: CreateQuestionDto): Promise<QuestionEntity> {
    try {
      const question = this.questionRepository.create(data);
      const saved = await this.questionRepository.save(question);
      await this.telegramService.sendToTelegramChannel(saved);
      return saved;
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

  private async getQuestionsWithFilter(
    data?: PaginateQuestionsDto,
    filter?: (queryBuilder: SelectQueryBuilder<QuestionEntity>) => void,
  ): Promise<QuestionEntity[]> {
    try {
      const pageNumber = +data.page || 1;
      const sortField = data.sortBy || 'created_at';
      const sortDirection = data.sortOrder || 'DESC';
      const take = 25;
      const skip = (pageNumber - 1) * take;
      const queryBuilder = this.questionRepository
        .createQueryBuilder('question')
        .orderBy(`question.${sortField}`, sortDirection)
        .skip(skip)
        .take(take);

      if (filter) {
        filter(queryBuilder);
      }

      const [questions] = await queryBuilder.getManyAndCount();

      return questions;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getQuestions(data: PaginateQuestionsDto): Promise<QuestionEntity[]> {
    return this.getQuestionsWithFilter(data);
  }

  async getUnansweredQuestions(
    data: PaginateQuestionsDto,
  ): Promise<QuestionEntity[]> {
    return this.getQuestionsWithFilter(data, (queryBuilder) => {
      queryBuilder.where('question.url_answer IS NULL');
    });
  }

  async getAnsweredQuestions(
    data: PaginateQuestionsDto,
  ): Promise<QuestionEntity[]> {
    return this.getQuestionsWithFilter(data, (queryBuilder) => {
      queryBuilder.where('question.url_answer IS NOT NULL');
    });
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

  async deleteQuestionById(id: number): Promise<void> {
    try {
      const question = await this.checkQuestionById(id);
      await this.questionRepository.delete(question.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
