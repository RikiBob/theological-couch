import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateAnswerDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
  @IsNotEmpty()
  question_summary: string;
}
