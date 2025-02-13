import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  // @IsEmail({}, {message: 'Incorrect email format'})
  email: string;
  @IsNotEmpty()
  question_text: string;
}
