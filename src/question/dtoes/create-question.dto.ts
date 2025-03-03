import { IsNotEmpty } from 'class-validator';

export class CreateQuestionDto {
  email?: string;
  telegram_id?: string;
  @IsNotEmpty()
  question_text: string;
}
