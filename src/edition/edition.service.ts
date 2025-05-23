import { BadRequestException, Injectable } from '@nestjs/common';
import { EditionEntity } from '../entities/edition.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateEditionsDto } from './dtoes/paginate-editions.dto';
import { CreateEditionDto } from './dtoes/create-edition.dto';

@Injectable()
export class EditionService {
  constructor(
    @InjectRepository(EditionEntity)
    private readonly editionRepository: Repository<EditionEntity>,
  ) {}

  async createEdition(data: CreateEditionDto): Promise<EditionEntity> {
    try {
      data.url_video = data.url_video.split('&')[0];
      const edition = this.editionRepository.create(data);

      return await this.editionRepository.save(edition);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getEditions(data: PaginateEditionsDto): Promise<EditionEntity[]> {
    try {
      const pageNumber = data.page || 1;
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

  private async checkEditionById(id: number): Promise<EditionEntity> {
    const edition = await this.editionRepository.findOneBy({ id: id });

    if (!edition) {
      throw new BadRequestException('Edition not found.');
    }

    return edition;
  }

  async deleteEditionById(id: number): Promise<void> {
    try {
      const edition = await this.checkEditionById(id);
      await this.editionRepository.delete(edition.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
