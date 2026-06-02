import { IdDto } from '../../dto/id.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAnnotationConnectionReqDto extends IdDto {
  @ApiProperty({
    description: 'The connected entity id.',
    example: 'bcf3a913-7c9b-4c46-a4b3-2e4d3926ef35',
  })
  @IsString()
  @IsNotEmpty()
  connectedId: string;
}
