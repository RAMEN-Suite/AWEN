export interface GRelationEnd {
  nodeId: string;
  role: string;
  bounds: {
    lowerBound: number;
    upperBound: number;
  };
}
