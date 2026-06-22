import { ApiProperty } from '@nestjs/swagger';
import { NodePropertyDto } from './node-property.dto';
import { ConnectedNodeDto } from './connected-node.dto';

export class AnnotationDto {
  @ApiProperty()
  type!: string;

  @ApiProperty()
  types!: string[];

  @ApiProperty()
  properties!: NodePropertyDto[];

  @ApiProperty()
  connectedNodes!: ConnectedNodeDto[];

  constructor(value: AnnotationDto) {
    Object.assign(this, value);
  }
}
