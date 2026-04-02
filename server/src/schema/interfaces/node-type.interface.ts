import { GAttribute } from './g-attribute.interface';

export interface NodeType {
  id: string;
  name: string;

  // nodeId, name
  superTypes: Map<string, string>;
  attributes: GAttribute[];
}
