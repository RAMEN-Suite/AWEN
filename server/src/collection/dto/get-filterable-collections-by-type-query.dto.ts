import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetFilterableCollectionsByTypeQueryDto {
  @ApiProperty({
    description: 'The id of the parent collection.',
    example: 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  parentId?: string;
}
