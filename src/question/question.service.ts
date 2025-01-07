import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionEntity } from "../entities/question.entity";
import { Repository } from "typeorm";
import { CreateQuestionDto } from "./dtoes/create-question";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>
  ) {}

  async createQuestion(data: CreateQuestionDto): Promise<QuestionEntity> {
    if(!data.question_text) {
      throw new BadRequestException('The question text field is empty')
    }

    const question = this.questionRepository.create(data);
    return await this.questionRepository.save(question);
  }
}
