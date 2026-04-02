import { DataType } from '../../schema/interfaces/data-type.interface';

export interface EmConfig {
  collectionChains: string[][];
  entityTypes: string[];
  dataTypes: DataType[];
}
