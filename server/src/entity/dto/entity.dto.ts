import {
  IsArray,
  IsObject,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class EntityDto {

  /**
   * The entities node label as defined by the guidelines. Normally `Entity`.
   * @example 'Entity'
   */
  @ApiProperty({
    description: 'The entities node label as defined by the guidelines. Normally `Entity`.',
    example: 'Entity'
  })
  @IsString()
  nodeLabel: string;

  /**
   * The types of the entity.
   * @example ['Person']
   */
  @ApiProperty({
    description: 'The types of the entity.',
    example: ['Person'],
    type: [String],
  })
  @IsString({each: true})
  @IsArray()
  types: string[];

  /**
   * The id of the entity. The id-type is an uuid.
   * @example 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35'
   */
  @ApiProperty({
    description: 'The id of the entity. The id-type is an uuid.',
    example: 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'The name/label of the entity.',
    example: 'Lee "Apollo" Adama',
  })
  @MinLength(3)
  @IsString()
  label: string;

  /**
   * Beliebige Key/Value-Properties der Entität.
   * Keys sind Strings; Values können beliebig sein.
   * @example {label: 'Aachen', department: ['RI05', 'RI13']}
   */
  @ApiProperty({
    description: 'Any key/value properties of the entity. Keys are strings; values can be anything.',
    example: {
      rank: 'Captain',
      positions: ['CAG', 'Lawyer']
    },
  })
  @IsObject()
  properties: Record<string, unknown>;

}