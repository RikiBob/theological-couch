import {
  Controller,
  Get,
  HttpStatus,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EditionService } from './edition.service';
import { EditionEntity } from '../entities/edition.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetEditionDto } from './dtoes/get-edition.dto';

@ApiTags('Edition')
@Controller()
export class EditionController {
  constructor(private readonly editionService: EditionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('editions/all')
  @ApiOperation({
    summary: 'Get all editions',
    description: 'Returns paginated and sorted list of editions',
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
    description: 'Successfully retrieved all editions',
    type: [GetEditionDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async getEditions(
    @Query('page', ParseIntPipe) page: number,
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
