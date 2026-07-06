import { ApiProperty } from '@nestjs/swagger';
import { ConnectedNodeDto } from './connected-node.dto';
import { AnnotationsOfEntityDto } from './annotations_of_entity.dto';

export class AnnotationsOfEntityWithContentDto extends AnnotationsOfEntityDto {
  @ApiProperty()
  connectedNodes!: ConnectedNodeDto[];

  constructor(value: AnnotationsOfEntityWithContentDto) {
    super(value);
    Object.assign(this, value);
  }
}
