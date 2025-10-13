import { IsArray, IsObject, IsString, IsUUID } from "class-validator";


export class EntityDto {

  /**
   * The entities node label as defined by the guidelines. Normally `Entity`.
   * @example 'Entity'
   */
  @IsString()
  nodeLabel: string;

  /**
   * The types of the entity.
   * @example ['Person']
   */
  @IsString({each: true})
  @IsArray()
  types: string[];

  /**
   * The id of the entity. The id-type is an uuid.
   * @example 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35'
   */
  @IsUUID()
  id: string;

  @IsString()
  label: string;

  /**
   * Beliebige Key/Value-Properties der Entität.
   * Keys sind Strings; Values können beliebig sein.
   * @example {label: 'Aachen', department: ['RI05', 'RI13']}
   */
  @IsObject()
  properties: Record<string, unknown>;

}