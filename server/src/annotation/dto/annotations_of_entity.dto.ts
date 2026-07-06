import { ApiProperty } from '@nestjs/swagger';
import { AnnotationDto } from './annotation.dto';

export class AnnotationsOfEntityDto extends AnnotationDto {
  @ApiProperty()
  direction!: string;

  constructor(value: AnnotationsOfEntityDto) {
    super(value);
    Object.assign(this, value);
  }
}
