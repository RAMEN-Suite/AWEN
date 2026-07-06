import { IsArray, IsNotEmpty, IsObject, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class OldEntityDto {
  /**
   * The entities node label as defined by the guidelines. Normally `Entity`.
   * @example 'Entity'
   */
  @ApiProperty({
    description: 'The entities node label as defined by the guidelines. Normally `Entity`.',
    example: 'Entity',
  })
  @IsString()
  nodeLabel!: string;

  /**
   * The types of the entity.
   * @example ['Person']
   */
  @ApiProperty({
    description: 'The types of the entity.',
    example: ['Person'],
    isArray: true,
    type: 'string',
  })
  @IsString({ each: true })
  @IsArray()
  @Transform(
    ({ value }) => {
      if (value === undefined || value === null || value === '') {
        throw new BadRequestException(['value must be an array of strings!']);
      }
      if (Array.isArray(value)) {
        let isString = true;
        for (const item of value) {
          isString = typeof item === 'string';
          if (!isString) {
            break;
          }
        }
        if (isString) {
          return value as string[];
        }
        throw new BadRequestException(['value must be an array of strings!']);
      }
      if (typeof value === 'string') {
        try {
          const dec = decodeURIComponent(value);
          return JSON.parse(dec) as string[];
        } catch {
          throw new BadRequestException(['value must be an array of strings!']);
        }
      }
      throw new BadRequestException(['value must be an array of strings!']);
    },
    { toClassOnly: true },
  )
  types!: string[];

  /**
   * The id of the entity.
   * @example 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35'
   */
  @ApiProperty({
    description: 'The id of the entity.',
    example: 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'The name/label of the entity.',
    example: 'Lee "Apollo" Adama',
  })
  @MinLength(3)
  @IsString()
  label!: string;

  /**
   * Beliebige Key/Value-Properties der Entität.
   * Keys sind Strings; Values können beliebig sein.
   * @example {label: 'Aachen', department: ['RI05', 'RI13']}
   */
  @ApiProperty({
    description: 'Any key/value properties of the entity. Keys are strings; values can be anything.',
    example: {
      rank: 'Captain',
      positions: ['CAG', 'Lawyer'],
    },
  })
  @IsObject()
  properties!: Record<string, unknown>;
}
