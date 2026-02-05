export interface GraphNode {
  id: string;
  type: string;
  label: string;

  attrs?: Record<string, any>;
}
