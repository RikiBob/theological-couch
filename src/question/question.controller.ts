import { Body, Controller, Post } from "@nestjs/common";
import { QuestionService } from './question.service';
import { CreateQuestionDto } from "./dtoes/create-question";
import { QuestionEntity } from "../entities/question.entity";

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}
  @Post()

  async createQuestion(@Body() data: CreateQuestionDto): Promise<QuestionEntity> {
    return await this.questionService.createQuestion(data);
  }
}
