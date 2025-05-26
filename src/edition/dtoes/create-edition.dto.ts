import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEditionDto {
  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=MaFJMZlvT70',
    description: 'URL for new edition',
  })
  @IsUrl()
  @IsNotEmpty()
  url_video: string;
  @ApiProperty({ example: 'Edition 27', description: 'Title for edition' })
  @IsNotEmpty()
  name: string;
}
