import { GRelationEnd } from './g-relation-end.interface';

export interface RelationType {
  id: string;
  name: string;
  superTypes: string[];
  from: GRelationEnd;
  to: GRelationEnd;
}
