import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=MaFJMZlvT70&t=106s',
    description: 'URL with response timecode',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;
  @ApiProperty({
    example: 'Summary text',
    description: 'Summary for the question',
  })
  @IsNotEmpty()
  question_summary: string;
}
