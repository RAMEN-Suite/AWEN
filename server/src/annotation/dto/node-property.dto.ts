import { ApiProperty } from '@nestjs/swagger';
import { GAttribute } from '../../schema/interfaces/g-attribute.interface';
import { GConstraint } from '../../schema/interfaces/g-constraint.interface';

// TODO: Type und Value richtig machen
export class NodePropertyDto implements GAttribute {
  @ApiProperty()
  value: string;
  @ApiProperty()
  bounds: {
    lowerBound: number;
    upperBound: number;
  };
  @ApiProperty()
  constraints?: GConstraint[];
  @ApiProperty()
  isKey: boolean;
  @ApiProperty()
  isReadOnly: boolean;
  @ApiProperty()
  name: string;
  @ApiProperty()
  typeId: string;

  constructor(value: NodePropertyDto) {
    Object.assign(this, value);
  }
}
