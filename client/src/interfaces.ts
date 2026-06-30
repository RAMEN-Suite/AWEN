export interface Entity {
  label: string;
  types: string[];
  properties: EntityPropertyDto[];
}

export interface EntityPropertyDto {
  value: unknown;
  bounds: {
    lowerBound: number;
    upperBound: number;
  };
  isKey: boolean;
  isReadOnly: boolean;
  name: string;
  typeId: string;
}

export interface Annotation {
  type: string;
  types: string[];
  properties: NodePropertyDto[];
  connectedNodes: ConnectedNodeDto[];
}

export interface ConnectedNodeDto {
  types: string[];
  properties: NodePropertyDto[];
  relationshipProperties: Record<string, never>;
  direction: string;
}

export interface DataType {
  id: string;
  name: string;
}

interface GConstraint {
  id: string;
  name: string;
  language: string;
  expression: string;
  severity: string;
  message: string;
  code: string;
  tags: string[];
}

export interface GAttribute {
  bounds: {
    lowerBound: number;
    upperBound: number;
  };
  constraints?: GConstraint[];
  isKey: boolean;
  isReadOnly: boolean;
  name: string;
  typeId: string;
}

export interface NodePropertyDto extends GAttribute {
  value: unknown;
}

export interface OldEntity {
  nodeLabel: string;
  types: string[];
  id: string;
  label: string;
  properties: Record<string, unknown>;
  collections: CollectionNameTypeDto[];
}

export interface EntityNames {
  label: string;
  id: string;
}

export interface EntitySearchQuery {
  label: string;
  collectionFilter?: Record<string, string[]>;
  types?: string[];
}

export interface EntityAutocompleteQuery {
  collectionFilter?: Record<string, string[]>;
  types?: string[];
}

export interface CollectionName {
  label: string;
  id: string;
}

export interface CollectionNameTypeDto {
  label: string;
  id: string;
  types: string[];
}

export interface EmConfigRemote {
  collectionChains: string[][];
  entityTypes: string[];
  annotationTypes: string[];
  dataTypes: DataType[];
}

export interface EmConfig {
  filterableCollections: string[];
  selectedCollectionChain: string[];
  entityTypes: string[];
}

export interface IEntity {
  metaType: string;
  types: string[];
  idLabel: string;
  nameLabel: string;
  properties: PropertyConfig[];
}

export interface PropertyConfig {
  name: string /* folioEnd, label, websiteUrl */;
  type: PropertyConfigDataType /* raw string, multiple options */;
  required: boolean /* required or optional */;
  editable: boolean /* Editable by user */;
  visible: boolean /* Visible by user */;
  propertyNode: boolean;
  /* Only relevant if type is "array" */
  items?: Partial<PropertyConfig>;
  minItems?: number;
  maxItems?: number;
  /* Only relevant if type is "number"/"integer" */
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  /* Only relevant if type is "string" */
  minLength?: number;
  maxLength?: number;
}

export type PropertyConfigDataType =
  | 'array'
  | 'boolean'
  | 'date'
  | 'date-time'
  | 'integer'
  | 'number'
  | 'string'
  | 'time';

export interface StatementNodeView {
  node: ConnectedNodeDto;
  id: string | null;
  entityLink: string | null;
  directionSeverity: 'success' | 'info';
}
