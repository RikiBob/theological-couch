import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
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

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Post('edition')
  async createEdition(
    @Body() data: CreateEditionDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.adminService.createEdition(data);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('answer/:id')
  async createAnswer(
    @Body() data: CreateAnswerDto,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    await this.adminService.createAnswer(data, +id);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('edition/:id')
  async deleteEdition(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    await this.adminService.deleteEditionById(id);
    return res.sendStatus(HttpStatus.OK);
  }
}
