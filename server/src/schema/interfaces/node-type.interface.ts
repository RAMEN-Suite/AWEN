import { GAttribute } from './g-attribute.interface';

export interface NodeType {
  id: string;
  name: string;
  superTypes: string[];
  attributes: GAttribute[];
}
