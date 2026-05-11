import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateAnnotationConnectionReqDto {
  @ApiProperty({
    description: 'The connected entity id.',
    example: 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35',
  })
  @IsUUID()
  connectionId: string;
}
