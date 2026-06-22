import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdDto {
  /**
   * The id of the entity.
   * @example 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35'
   */
  @ApiProperty({
    description: 'The id of the entity/collection/annotation.',
    example: 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35',
    type: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
}
