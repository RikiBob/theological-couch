import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EditionService } from './edition.service';
import { EditionEntity } from '../entities/edition.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller()
export class EditionController {
  constructor(private readonly editionService: EditionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('editions/all')
  async getEditions(
    @Query('page') page: string,
    @Query('sortBy') sortBy: 'created_at',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC',
  ): Promise<EditionEntity[]> {
    return await this.editionService.getEditions({
      page,
      sortBy,
      sortOrder,
    });
  }
}
