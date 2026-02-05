export interface GAttribute {
  name: string;
  typeId: string;
  bounds: {
    lowerBound: number;
    upperBound: number;
  };

  isKey?: boolean;
  isReadOnly?: boolean;
}
