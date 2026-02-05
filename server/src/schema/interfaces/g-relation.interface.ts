import { GRelationEnd } from './g-relation-end.interface';

export interface GRelation {
  kind: 'GRelation';
  id: string;
  name: string;

  superTypes: string[];

  from: GRelationEnd;
  to: GRelationEnd;
}
