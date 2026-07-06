import { ApiProperty } from '@nestjs/swagger';
import { NodePropertyDto } from './node-property.dto';

export class AnnotationDto {
  @ApiProperty()
  type!: string;

  @ApiProperty()
  types!: string[];

  @ApiProperty()
  properties!: NodePropertyDto[];

  constructor(value: AnnotationDto) {
    Object.assign(this, value);
  }
}
