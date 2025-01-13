import { Body, Controller, Get, HttpStatus, Post, Query, Res, UseGuards } from "@nestjs/common";
import { QuestionService } from './question.service';
import { CreateQuestionDto } from "./dtoes/create-question.dto";
import { QuestionEntity } from "../entities/question.entity";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { Response } from "express";

@Controller()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('question')
  async createQuestion(@Body() data: CreateQuestionDto, @Res() res: Response): Promise<Response> {
    await this.questionService.createQuestion(data);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Get('questions/all')
  async getQuestions(
    @Query('page') page: string,
    @Query('sortBy') sortBy: 'created_at',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC',
  ): Promise<QuestionEntity[]> {
    return await this.questionService.getQuestions(
      {
        page,
        sortBy,
        sortOrder
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('questions/unanswered')
  async getUnansweredQuestions(
    @Query('page') page: string,
    @Query('sortBy') sortBy: 'created_at',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC',
  ): Promise<QuestionEntity[]> {
    return await this.questionService.getUnansweredQuestions(
      {
        page,
        sortBy,
        sortOrder
      }
    )
  }
}
