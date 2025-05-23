import { ApiProperty } from '@nestjs/swagger';

export class GetEditionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url_video: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
