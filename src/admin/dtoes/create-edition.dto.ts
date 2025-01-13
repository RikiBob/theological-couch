import { IsNotEmpty } from "class-validator";

export class CreateEditionDto {
  @IsNotEmpty()
  url_video: string;
  name: string;
}