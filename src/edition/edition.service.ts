import { BadRequestException, Injectable } from '@nestjs/common';
import { EditionEntity } from '../entities/edition.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetEditionsDto } from './dtoes/get-editions.dto';

@Injectable()
export class EditionService {
  constructor(
    @InjectRepository(EditionEntity)
    private readonly editionRepository: Repository<EditionEntity>,
  ) {}

  async getEditions(data: GetEditionsDto): Promise<EditionEntity[]> {
    try {
      const pageNumber = +data.page || 1;
      const sortField = data.sortBy || 'created_at';
      const sortDirection = data.sortOrder || 'DESC';
      const take = 25;
      const skip = (pageNumber - 1) * take;

      const queryBuilder = this.editionRepository
        .createQueryBuilder('question')
        .orderBy(`question.${sortField}`, sortDirection)
        .skip(skip)
        .take(take);

      const [questions] = await queryBuilder.getManyAndCount();
      return questions;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
