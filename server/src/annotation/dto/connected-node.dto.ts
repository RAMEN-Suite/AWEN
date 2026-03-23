import { ApiProperty } from '@nestjs/swagger';
import { NodePropertyDto } from './node-property.dto';

export class ConnectedNodeDto {
  @ApiProperty()
  types: string[];

  @ApiProperty()
  properties: NodePropertyDto[];

  @ApiProperty()
  relationshipProperties: Record<string, any>;

  @ApiProperty()
  direction: string;

  constructor(data: ConnectedNodeDto) {
    this.types = data.types;
    this.properties = data.properties;
    this.relationshipProperties = data.relationshipProperties;
    this.direction = data.direction;
  }
}
