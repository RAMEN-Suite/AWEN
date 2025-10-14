import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';

/**
 * Für Swagger/OpenAPI taugen String-Unions alleine nicht.
 * Dieses Pattern erzeugt korrekte Enum-Doku UND lässt den TS-Typ streng.
 */
export const PropertyConfigDataTypes = [
  'array',
  'boolean',
  'date',
  'date-time',
  'integer',
  'number',
  'string',
  'time',
] as const;
export type PropertyConfigDataType = typeof PropertyConfigDataTypes[number];

@ApiExtraModels() // Platzhalter – keeping for potential ext.
export class PropertyConfig {
  @ApiProperty({
    description:
      'Interner Property-Name (z. B. "folioEnd", "label", "websiteUrl").',
    example: 'label',
  })
  name: string;

  @ApiProperty({
    description: 'Datentyp der Property.',
    enum: PropertyConfigDataTypes,
    enumName: 'PropertyConfigDataType',
    example: 'string',
  })
  type: PropertyConfigDataType;

  @ApiProperty({
    description: 'Ob der Wert zwingend vorhanden sein muss.',
    example: true,
  })
  required: boolean;

  @ApiProperty({
    description: 'Ob der Wert durch Nutzer:innen bearbeitet werden darf.',
    example: true,
  })
  editable: boolean;

  @ApiProperty({
    description: 'Ob die Property in der UI angezeigt wird.',
    example: true,
  })
  visible: boolean;

  @ApiPropertyOptional({
    description:
      'Nur relevant bei "array": Schema für die einzelnen Items. Teilspezifikation erlaubt.',
    type: () => PropertyConfig,
    example: { type: 'string', required: true, visible: true },
  })
  items?: Partial<PropertyConfig>;

  @ApiPropertyOptional({
    description: 'Nur relevant bei "array": Minimale Anzahl Items.',
    example: 1,
  })
  minItems?: number;

  @ApiPropertyOptional({
    description: 'Nur relevant bei "array": Maximale Anzahl Items.',
    example: 10,
  })
  maxItems?: number;

  @ApiPropertyOptional({
    description: 'Nur relevant bei "number"/"integer": Minimalwert (inklusive).',
    example: 0,
  })
  minimum?: number;

  @ApiPropertyOptional({
    description: 'Nur relevant bei "number"/"integer": Maximalwert (inklusive).',
    example: 100,
  })
  maximum?: number;

  @ApiPropertyOptional({
    description:
      'Nur relevant bei "number"/"integer": Exklusives Minimum (größer als).',
    example: 0,
  })
  exclusiveMinimum?: number;

  @ApiPropertyOptional({
    description:
      'Nur relevant bei "number"/"integer": Exklusives Maximum (kleiner als).',
    example: 100,
  })
  exclusiveMaximum?: number;

  @ApiPropertyOptional({
    description: 'Nur relevant bei "string": Minimale Länge.',
    example: 3,
  })
  minLength?: number;

  @ApiPropertyOptional({
    description: 'Nur relevant bei "string": Maximale Länge.',
    example: 255,
  })
  maxLength?: number;
}

@ApiExtraModels(PropertyConfig)
export class IEntity {
  @ApiProperty({
    description:
      'Metatyp / Oberkategorie des Entity (frei definierbar, z. B. "node").',
    example: 'node',
  })
  metaType: string;

  @ApiProperty({
    description:
      'Spezifische Typen/Labels des Entity (z. B. Graph-Labels).',
    type: [String],
    example: ['Entity', 'Organization'],
  })
  types: string[];

  @ApiProperty({
    description:
      'Property-Name, der die eindeutige ID enthält (z. B. "id").',
    example: 'id',
  })
  idLabel: string;

  @ApiProperty({
    description:
      'Property-Name, der die menschenlesbare Bezeichnung enthält (z. B. "nameLabel").',
    example: 'nameLabel',
  })
  nameLabel: string;

  @ApiProperty({
    description: 'Konfiguration der verfügbaren Properties.',
    type: () => [PropertyConfig],
  })
  properties: PropertyConfig[];
}

export class FulltextIndexes {
  @ApiProperty({
    description:
      'Name des Neo4j-Fulltext-Indexes, der auf die Entity-Property "nameLabel" zeigt.',
    example: 'entity_name_fulltext',
  })
  search: string;
}

export class FindByCollectionScenario {
  @ApiProperty({
    description:
      'Kettenfolge von Collection-Labels/Beziehungen, um Entities über Collections zu finden. Es wird davon ausgegangen, das der letzte Array Eintrag der generischste Collection Typ ist.',
    example: ["Regesta", "Volume", "Department"],
  })
  collectionChain: string[];

  @ApiProperty({
    description:
      'Liste von Property-Namen, die vom Client als Filter verwendet werden dürfen.',
    example: ["Volume", "Department"],
    type: [String],
  })
  filterable: string[];
}

export class Scenarios {
  @ApiProperty({
    description:
      'Szenario: Entities anhand einer Collection ableiten/filtern.',
    type: () => FindByCollectionScenario,
  })
  findByCollection: FindByCollectionScenario;
}

@ApiExtraModels(IEntity, PropertyConfig, FulltextIndexes, Scenarios, FindByCollectionScenario)
export class IGuidelines {
  @ApiProperty({
    description:
      'Definition des Entity-Modells (Labels, Namens- und ID-Felder, Property-Schema).',
    type: () => IEntity,
  })
  entity: IEntity;

  @ApiProperty({
    description:
      'Definition des Collection-Modells (Labels, Namens- und ID-Felder, Property-Schema).',
    type: () => IEntity,
  })
  collection: IEntity;

  @ApiProperty({
    description: 'Bezeichnungen der erforderlichen Fulltext-Indizes.',
    type: () => FulltextIndexes,
  })
  fulltextIndexes: FulltextIndexes;

  @ApiProperty({
    description: 'Vordefinierte Abfrage-/Filter-Szenarien.',
    type: () => Scenarios,
  })
  scenarios: Scenarios;
}
