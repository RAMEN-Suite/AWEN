import { GAttribute } from './g-attribute.interface';

export interface GNode {
  kind: 'GNode';
  id: string;
  name: string;

  superTypes: string[];
  attributes: GAttribute[];
  constraints?: unknown[];
}
