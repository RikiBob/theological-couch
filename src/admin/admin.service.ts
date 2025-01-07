import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EditionEntity } from "../entities/edition.entity";
import { Repository } from "typeorm";
import { CreateEditionDto } from "./dtoes/create-edition.dto";
import { QuestionEntity } from "../entities/question.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(EditionEntity)
    private readonly editionRepository: Repository<EditionEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>
  ) {}

  async createEdition(data: CreateEditionDto): Promise<EditionEntity> {
    if(!data.name || !data.url_video) {
      throw new BadRequestException('The name or url field is empty');
    }

    const edition = this.editionRepository.create(data);
    return await this.editionRepository.save(edition);
  }

  async createResponse(url: string, questionId: number): Promise<EditionEntity> {
    if(!url) {
      throw new BadRequestException('The url field is empty');
    }

    const question = await this.questionRepository.findOneBy({ id: questionId });

    if (!question) {
      throw new BadRequestException('Question not found.');
    }

    const parseUrl = url.split('&t=')[0];
    const edition = await this.editionRepository.findOneBy({url_video: parseUrl});

    if (!edition) {
      throw new BadRequestException('Video not found.');
    }

    await this.questionRepository.update(
      {id: questionId},
      {url_response: url, edition_id: edition.id});
    return edition;
  }
}
