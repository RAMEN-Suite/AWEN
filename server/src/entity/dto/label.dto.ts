import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LabelDto {

  @ApiProperty({
    description: 'The name/label of the entity.',
    example: 'Lee "Apollo" Adama',
    minLength: 3,
    required: true,
  })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  label: string;

}