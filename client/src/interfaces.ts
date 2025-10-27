

export interface Entity {
  nodeLabel: string;
  types: string[];
  id: string;
  label: string;
  properties: Record<string, unknown>;
}

export interface EntityNames {
  label: string;
  id: string;
}

export interface EntitySearchQuery {
  label: string;
  collectionFilter?: Record<string, string[]>;
}

export interface CollectionName {
  label: string;
  id: string;
}



export interface IGuidelines {
  entity: IEntity;

  // names of the required fulltext indexes
  fulltextIndexes: {
    // A neo4j fulltext index, that queries the Entity-Node-Property `nameLabel`
    search: string;
  }

  scenarios: {
    findByCollection: {
      collectionChain: string[];
      filterable: string[];
    }
  }
}

export type IEntity = {
  metaType: string;
  types: string[];
  idLabel: string;
  nameLabel: string;
  properties: PropertyConfig[]
}

export type PropertyConfig = {
  name: string /* folioEnd, label, websiteUrl */;
  type: PropertyConfigDataType /* raw string, multiple options */;
  required: boolean /* required or optional */;
  editable: boolean /* Editable by user */;
  visible: boolean /* Visible by user */;
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
};

export type PropertyConfigDataType =
  | 'array'
  | 'boolean'
  | 'date'
  | 'date-time'
  | 'integer'
  | 'number'
  | 'string'
  | 'time';
