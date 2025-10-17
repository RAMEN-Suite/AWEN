import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class IdDto {

  /**
   * The id of the entity. The id-type is an uuid.
   * @example 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35'
   */
  @ApiProperty({
    description: 'The id of the entity/collection/annotation. The id-type is an uuid.',
    example: 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35',
    type: 'string',
    required: true,
  })
  @IsUUID()
  id: string;

}