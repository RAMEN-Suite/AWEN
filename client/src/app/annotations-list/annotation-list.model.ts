import type {
  AnnotationOfEntityWithContent,
  StatementNodeView,
} from '../../interfaces';

export interface StatementAnnotationView {
  annotation: AnnotationOfEntityWithContent;
  id: string | null;
  nodes: StatementNodeView[];
}

export interface AnnotationGroupView {
  type: string;
  annotations: StatementAnnotationView[];
}
