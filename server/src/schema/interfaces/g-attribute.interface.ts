import { GConstraint } from './g-constraint.interface';

export interface GAttribute {
  name: string;
  typeId: string;
  bounds: {
    lowerBound: number;
    upperBound: number;
  };
  constraints?: GConstraint[];
  isKey?: boolean;
  isReadOnly?: boolean;
}
