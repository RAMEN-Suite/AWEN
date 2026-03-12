import { ApiProperty } from '@nestjs/swagger';
import { GAttribute } from '../../schema/interfaces/g-attribute.interface';

// TODO: Type und Value richtig machen
export class AnnotationPropertyDto implements GAttribute {
  @ApiProperty()
  value: string;
  @ApiProperty()
  bounds: {
    lowerBound: number;
    upperBound: number;
  };
  @ApiProperty()
  isKey: boolean;
  @ApiProperty()
  isReadOnly: boolean;
  @ApiProperty()
  name: string;
  @ApiProperty()
  typeId: string;

  constructor(value: AnnotationPropertyDto) {
    Object.assign(this, value);
  }
}
