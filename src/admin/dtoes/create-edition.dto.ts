import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateEditionDto {
  @IsUrl()
  @IsNotEmpty()
  url_video: string;
  @IsNotEmpty()
  name: string;
}
