import { Body, Controller, HttpStatus, Param, Patch, Post, Res, UseGuards } from "@nestjs/common";
import { AdminService } from './admin.service';
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { CreateEditionDto } from "./dtoes/create-edition.dto";
import { EditionEntity } from "../entities/edition.entity";
import { CreateResponseDto } from "./dtoes/create-response.dto";
import { Response } from "express";

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Post('edition')
  async createEdition(@Body() data: CreateEditionDto): Promise<EditionEntity> {
    return await this.adminService.createEdition(data);
  }

  @Patch('question/:id')
  async createResponse(
    @Body() data: CreateResponseDto,
    @Param('id') id: string,
    @Res() res: Response): Promise<Response> {
    await this.adminService.createResponse(data.url, +id);
    return res.sendStatus(HttpStatus.OK);
  }
}
