import { GRelation } from './g-relation.interface';
import { GImport } from './g-import.interface';
import { GClassifier } from './g-classifier.interface';

export interface GModel {
  $schema: string;
  $id: string;

  id: string;
  version: string;
  kind: 'GModel';
  name: string;

  imports: GImport[];
  classifiers: GClassifier[];
  relations: GRelation[];

  ext?: Record<string, any>;
}
