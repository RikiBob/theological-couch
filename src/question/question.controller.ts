import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseIntPipe,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetQuestionDto } from './dtoes/get-question.dto';

@ApiTags('Question')
@Controller()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('question')
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
  @Get('questions/all')
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
  @Get('questions/unanswered')
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
  @Get('questions/answered')
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
}
