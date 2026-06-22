import { ApiProperty } from '@nestjs/swagger';
import { EntityPropertyDto } from './entity-property.dto';

export class EntityDto {
  @ApiProperty()
  label!: string;

  @ApiProperty()
  types!: string[];

  @ApiProperty()
  properties!: EntityPropertyDto[];

  constructor(value: EntityDto) {
    Object.assign(this, value);
  }
}
