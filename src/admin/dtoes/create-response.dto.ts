import { IsNotEmpty } from "class-validator";

export class CreateResponseDto {
  @IsNotEmpty()
  url: string
}