import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email field',
    required: false,
  })
  email?: string;
  @ApiProperty({
    example: '862555263',
    description: 'Telegram id field',
    required: false,
  })
  telegram_id?: string;
  @ApiProperty({
    example: 'Question text',
    description: 'Question field',
  })
  @IsNotEmpty()
  question_text: string;
}
