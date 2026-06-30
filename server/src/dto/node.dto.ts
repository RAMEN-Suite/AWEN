import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsString } from 'class-validator';

export abstract class NodeDto {
  @ApiProperty({
    description: 'The RAMEN type of the Node.',
    examples: ['Entity', 'Collection', 'Annotation'],
  })
  @IsString()
  abstract ramenType: string;

  @ApiProperty({
    description: 'The types of the Node.',
    example: ['Person', 'Place', 'Next', 'Volume', 'Department'],
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  types!: string[];

  @ApiProperty({
    description: 'Key/value properties of the node.',
    example: {
      rank: 'Captain',
      positions: ['CAG', 'Lawyer'],
    },
  })
  @IsObject()
  properties!: Record<string, unknown>;

  protected constructor(properties: Record<string, unknown>, types?: string[]) {
    this.properties = properties;
    this.types = types ?? [];
  }
}
