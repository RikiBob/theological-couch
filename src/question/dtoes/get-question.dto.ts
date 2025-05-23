import { ApiProperty } from '@nestjs/swagger';

export class GetQuestionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  telegram_id: number;

  @ApiProperty()
  question_text: string;

  @ApiProperty()
  url_answer: string;

  @ApiProperty()
  question_summary: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  edition_id: number;
}
