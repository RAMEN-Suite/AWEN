import { IsUUID } from "class-validator";

export class IdDto {

  /**
   * The id of the entity. The id-type is an uuid.
   * @example 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35'
   */
  @IsUUID()
  id: string;

}