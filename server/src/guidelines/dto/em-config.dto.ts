import { ApiProperty } from '@nestjs/swagger';
import { EmConfig } from '../interfaces/em-config.interface';
import { DataType } from '../../schema/interfaces/data-type.interface';

export class EmConfigDto implements EmConfig {
  @ApiProperty()
  collectionChains: string[][];

  @ApiProperty()
  entityTypes: string[];

  @ApiProperty()
  dataTypes: DataType[];

  constructor(value: EmConfig) {
    Object.assign(this, value);
  }
}
