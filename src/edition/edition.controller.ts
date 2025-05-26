import {
  Body,
  Controller, Delete,
  Get,
  HttpStatus, Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EditionService } from './edition.service';
import { EditionEntity } from '../entities/edition.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation, ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetEditionDto } from './dtoes/get-edition.dto';
import { CreateEditionDto } from './dtoes/create-edition.dto';
import { Response } from 'express';

@ApiTags('Edition')
@Controller('editions')
export class EditionController {
  constructor(private readonly editionService: EditionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
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
    await this.editionService.createEdition(data);
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
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
    await this.editionService.deleteEditionById(id);
    return res.sendStatus(HttpStatus.OK);
  }
}
