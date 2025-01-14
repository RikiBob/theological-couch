import { Controller, Get, Query } from "@nestjs/common";
import { EditionService } from './edition.service';
import { QuestionEntity } from "../entities/question.entity";
import { EditionEntity } from "../entities/edition.entity";

@Controller()
export class EditionController {
  constructor(private readonly editionService: EditionService) {
  }

  @Get('editions/all')
  async getEditions(
    @Query('page') page: string,
    @Query('sortBy') sortBy: 'created_at',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC',
  ): Promise<EditionEntity[]> {
    return await this.editionService.getEditions(
      {
        page,
        sortBy,
        sortOrder
      }
    );
  }}