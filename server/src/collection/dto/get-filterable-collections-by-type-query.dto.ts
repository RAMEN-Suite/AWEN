import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class GetFilterableCollectionsByTypeQueryDto {
  @ApiProperty({
    description: 'The id of the parent collection. The id-type is an uuid.',
    example: 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
