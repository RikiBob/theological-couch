import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateEditionDto } from './dtoes/create-edition.dto';
import { CreateAnswerDto } from './dtoes/create-answer.dto';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Post('edition')
  @ApiOperation({
    summary: 'Add a new edition',
    description: 'Creates a new edition in the system',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Edition successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  @ApiBody({ type: CreateEditionDto })
  async createEdition(
    @Body() data: CreateEditionDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.adminService.createEdition(data);
    return res.sendStatus(HttpStatus.OK);
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
    await this.adminService.createAnswer(data, id);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('edition/:id')
  @ApiOperation({
    summary: 'Delete an edition',
    description: 'Deletes an edition by its ID',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the edition to delete',
    example: 27,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully deleted' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async deleteEdition(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<Response> {
    await this.adminService.deleteEditionById(id);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('question/:id')
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
    await this.adminService.deleteQuestionById(id);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('question/:id')
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
    await this.adminService.rollbackAnswerById(id);
    return res.sendStatus(HttpStatus.OK);
  }
}
