import { IsNotEmpty } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  url: string;
  @IsNotEmpty()
  question_summary: string;
}
