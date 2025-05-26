import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dtoes/create-question.dto';
import { QuestionEntity } from '../entities/question.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetQuestionDto } from './dtoes/get-question.dto';
import { CreateAnswerDto } from './dtoes/create-answer.dto';

@ApiTags('Question')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a new question',
    description: 'Creates a new question in the system',
  })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully created question',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async createQuestion(
    @Body() data: CreateQuestionDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.questionService.createQuestion(data);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all questions',
    description: 'Returns paginated and sorted list of questions',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'sortBy',
    enum: ['created_at'],
    description: 'Field to sort the results by',
    example: 'created_at',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order, ascending or descending',
    example: 'ACS',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all questions',
    type: [GetQuestionDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async getQuestions(
    @Query('page', ParseIntPipe) page: number,
    @Query('sortBy') sortBy: 'created_at',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC',
  ): Promise<QuestionEntity[]> {
    return await this.questionService.getQuestions({
      page,
      sortBy,
      sortOrder,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('unanswered')
  @ApiOperation({
    summary: 'Get unanswered questions',
    description: 'Returns paginated and sorted list of questions',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'sortBy',
    enum: ['created_at'],
    description: 'Field to sort the results by',
    example: 'created_at',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order, ascending or descending',
    example: 'ACS',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved unanswered questions',
    type: [GetQuestionDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async getUnansweredQuestions(
    @Query('page') page: string,
    @Query('sortBy') sortBy: 'created_at',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC',
  ): Promise<QuestionEntity[]> {
    return await this.questionService.getUnansweredQuestions({
      page,
      sortBy,
      sortOrder,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('answered')
  @ApiOperation({
    summary: 'Get answered questions',
    description: 'Returns paginated and sorted list of questions',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'sortBy',
    enum: ['created_at'],
    description: 'Field to sort the results by',
    example: 'created_at',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order, ascending or descending',
    example: 'ACS',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved answered questions',
    type: [GetQuestionDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async getAnsweredQuestions(
    @Query('page') page: string,
    @Query('sortBy') sortBy: 'created_at',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC',
  ): Promise<QuestionEntity[]> {
    return await this.questionService.getAnsweredQuestions({
      page,
      sortBy,
      sortOrder,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('answer/:id')
  @ApiOperation({
    summary: 'Add an answer',
    description: 'Add an answer to the question with the specified ID',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the question to which the answer is attached',
    example: 27,
  })
  @ApiBody({ type: CreateAnswerDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Answer successfully updated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async createAnswer(
    @Body() data: CreateAnswerDto,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<Response> {
    await this.questionService.createAnswer(data, id);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('rollback/:id')
  @ApiOperation({
    summary: 'Rollback answer from question',
    description: 'Removes the answer field from a question by its ID',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'D of the question from which the answer will be removed',
    example: 27,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully deleted' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async rollbackAnswerById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<Response> {
    await this.questionService.rollbackAnswerById(id);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a question',
    description: 'Deletes a question by its ID',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the question to delete',
    example: 27,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully deleted' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async deleteQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<Response> {
    await this.questionService.deleteQuestionById(id);
    return res.sendStatus(HttpStatus.OK);
  }
}
