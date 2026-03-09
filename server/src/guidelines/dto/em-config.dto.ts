import { ApiProperty } from '@nestjs/swagger';
import { EmConfig } from '../interfaces/em-config.interface';

export class EmConfigDto implements EmConfig {
  @ApiProperty()
  collectionChains: string[][];

  @ApiProperty()
  entityTypes: string[];

  constructor(value: EmConfig) {
    Object.assign(this, value);
  }
}
