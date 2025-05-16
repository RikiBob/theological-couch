import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from '../entities/question.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateQuestionDto } from './dtoes/create-question.dto';
import { GetQuestionsDto } from './dtoes/get-questions.dto';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class QuestionService {
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
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

  private async getQuestionsWithFilter(
    data?: GetQuestionsDto,
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

  async getQuestions(data: GetQuestionsDto): Promise<QuestionEntity[]> {
    return this.getQuestionsWithFilter(data);
  }

  async getUnansweredQuestions(
    data: GetQuestionsDto,
  ): Promise<QuestionEntity[]> {
    return this.getQuestionsWithFilter(data, (queryBuilder) => {
      queryBuilder.where('question.url_answer IS NULL');
    });
  }

  async getAnsweredQuestions(data: GetQuestionsDto): Promise<QuestionEntity[]> {
    return this.getQuestionsWithFilter(data, (queryBuilder) => {
      queryBuilder.where('question.url_answer IS NOT NULL');
    });
  }
}
