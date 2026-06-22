import { ApiProperty } from '@nestjs/swagger';
import { EmConfig } from '../interfaces/em-config.interface';
import { DataType } from '../../schema/interfaces/data-type.interface';

export class EmConfigDto implements EmConfig {
  @ApiProperty()
  collectionChains!: string[][];

  @ApiProperty()
  entityTypes!: string[];

  @ApiProperty({
    description: 'Possible Node Labels for the Annotation Nodes',
  })
  annotationTypes!: string[];

  // @ApiProperty({
  //  description: 'Possible types asserted via the Node property "type" the Annotation Nodes',
  // })
  // annotationTypeAttributes: string[];

  @ApiProperty()
  dataTypes!: DataType[];

  constructor(value: EmConfig) {
    Object.assign(this, value);
  }
}
