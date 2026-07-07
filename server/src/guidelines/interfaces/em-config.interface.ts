import { DataType } from '../../schema/interfaces/data-type.interface';

export interface EmConfig {
  collectionChains: string[][];
  entityTypes: string[];
  annotationTypes: string[];
  // annotationTypeAttributes: string[];
  dataTypes: DataType[];
  camiAvailable: boolean;
}
