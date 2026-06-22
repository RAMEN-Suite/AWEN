import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  MinLength,
} from 'class-validator';

export class CollectionDto {
  @ApiProperty({
    description:
      'The collection node label as defined by the guidelines. Normally `Collection`.',
    example: 'Collection',
  })
  @IsString()
  nodeLabel!: string;

  /**
   * The types of the entity.
   * @example ['Person']
   */
  @ApiProperty({
    description: 'The types of the collection.',
    example: ['Regesta'],
    isArray: true,
    type: 'string',
  })
  @IsString({ each: true })
  @IsArray()
  types!: string[];

  /**
   * The id of the entity.
   * @example 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35'
   */
  @ApiProperty({
    description: 'The id of the collection.',
    example: 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'The name/label of the collection.',
    example: 'Lee "Apollo" Adama',
  })
  @MinLength(3)
  @IsString()
  label!: string;

  @ApiProperty({
    description:
      'Any key/value properties of the collection. Keys are strings; values can be anything.',
    example: {
      rank: 'Captain',
      positions: ['CAG', 'Lawyer'],
    },
  })
  @IsObject()
  properties!: Record<string, unknown>;
}
