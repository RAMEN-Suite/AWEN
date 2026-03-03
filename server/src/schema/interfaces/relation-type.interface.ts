import { GRelationEnd } from './g-relation-end.interface';

export interface RelationType {
  id: string;
  name: string;
  superTypes: Map<string, string>;
  from: GRelationEnd;
  to: GRelationEnd;
}
