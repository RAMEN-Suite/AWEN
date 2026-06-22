import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EntityNamesDto {
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
  @IsString()
  label!: string;

  constructor(id: string, label: string) {
    this.id = id;
    this.label = label;
  }
}
