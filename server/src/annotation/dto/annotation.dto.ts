import { ApiProperty } from '@nestjs/swagger';
import { AnnotationPropertyDto } from './annotation-property.dto';

export class AnnotationDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  types: string[];

  @ApiProperty()
  properties: AnnotationPropertyDto[];

  constructor(value: AnnotationDto) {
    Object.assign(this, value);
  }
}
