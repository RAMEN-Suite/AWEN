import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LabelDto {

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  label: string;

}