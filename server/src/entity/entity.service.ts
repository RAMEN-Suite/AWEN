import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import { GuidelinesService } from '../guidelines/guidelines.service';
import { EntityNamesDto } from './dto/entity-names.dto';
import Cypher, { PartialPattern, Pattern, type SetParam } from '@neo4j/cypher-builder';
import { EntitySearchDto } from './dto/entity-search.dto';
import { EntityCollectionNameDto } from './dto/entity-collection-name.dto';
import { CollectionService } from '../collection/collection.service';
import { EntityAutocompleteQueryDto } from './dto/entity-autocomplete-query.dto';
import { RamenModelService } from '../schema/ramen-model.service';
import { NodeRepository } from '../graph/node-repository.service';
import { EntityNodeDto } from './dto/entity-node.dto';
import { transformNodesToEntityNodeDTOs, transformNodeToEntityDTO } from '../utils/node-transformers';
import { Integer, Node } from 'neo4j-driver';
import {
  ANNOTATION_LABEL_NAME,
  COLLECTION_LABEL_NAME,
  ENTITY_LABEL_NAME,
  ENTITY_NAME_PROPERTY,
  FROM_ANNOTATION_REL_TYPE,
  TO_ANNOTATION_REL_TYPE,
} from '../constants';
import { EntityDto } from './dto/entity.dto';
import { RAMENError } from '../schema/RAMENError';
import { metadataForNewNode, metadataForUpdateNode } from '../utils/utils';

@Injectable()
export class EntityService implements OnApplicationBootstrap {
  logger = new Logger(EntityService.name);

  ENTITY_KEY_PROPERTY!: string;

  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly guidelinesService: GuidelinesService,
    private readonly collectionService: CollectionService,
    private readonly model: RamenModelService,
    private readonly nodes: NodeRepository,
  ) {
    this.ENTITY_KEY_PROPERTY = this.model.getNodeKeyField(ENTITY_LABEL_NAME);
  }

  async onApplicationBootstrap() {
    await this.createSearchFulltextIndex();
  }

  async getById(id: string): Promise<EntityDto | undefined> {
    const entityNode: Node<Integer, Record<string, unknown>> | undefined = await this.nodes.getById(id, {
      labels: ENTITY_LABEL_NAME,
      keyName: this.ENTITY_KEY_PROPERTY,
    });
    if (!entityNode) return undefined;

    const gNode = this.model.getMostSpecificType(entityNode.labels);
    if (!gNode) return undefined;

    return transformNodeToEntityDTO(entityNode, gNode);
  }

  async getByProperty(key: string, value: string): Promise<EntityNodeDto[]> {
    const entityNodes: Node<Integer, Record<string, unknown>>[] = await this.nodes.getByProperty(key, value, {
      labels: ENTITY_LABEL_NAME,
    });

    // TODO: zum normalen DTO
    return transformNodesToEntityNodeDTOs(entityNodes);
  }

  async findNamesByName(name: string, queryParams: EntityAutocompleteQueryDto): Promise<EntityNamesDto[]> {
    const eNode = new Cypher.Node();
    const score = new Cypher.Variable();

    const searchPattern = await this.runSearch(eNode, score, name);

    let collPattern: undefined | Pattern = undefined;

    if (queryParams.collectionFilter && Object.keys(queryParams.collectionFilter).length > 0) {
      collPattern = this.addFilterByCollection(eNode, queryParams.collectionFilter);
    }

    let typePatten: undefined | Pattern = undefined;

    if (queryParams.types) {
      typePatten = this.addFilterByTypes(eNode, queryParams.types);
    }

    let query = searchPattern;

    query = await this.addOrderByProperty(query, eNode, [[score, 'ASC']]);

    if (typePatten) {
      query = query.with(eNode, score).match(typePatten).with(eNode, score).distinct();
    }

    // Wenn ein Collection-Filter existiert, erweitern wir den Query mit MATCH
    if (collPattern) {
      query = query.with(eNode, score).match(collPattern).with(eNode, score).distinct();
    }

    query = await this.addOrderByProperty(query, eNode, [[score, 'ASC']]);

    const { cypher, params } = query
      .return([eNode.property(ENTITY_NAME_PROPERTY), 'label'], [eNode.property(this.ENTITY_KEY_PROPERTY), 'id'])
      .build();

    const res = await this.neo4jService.read<{ label: string; id: string }>(cypher, params);

    const entities = res.records.map((record) => ({
      label: record.get('label'),
      id: record.get('id'),
    }));

    return entities;
  }

  private async runSearch(eNode: Cypher.Node, score: Cypher.Variable, query: string) {
    const guidelines = await this.guidelinesService.get();

    return new Cypher.With('*')
      .callProcedure(Cypher.db.index.fulltext.queryNodes(guidelines.fulltextIndexes.search, new Cypher.Literal(query)))
      .yield(['node', eNode], ['score', score])
      .with(eNode, score);
  }

  private async entityReturnMap(eNode: Cypher.Node, query: Cypher.With) {
    const l = new Cypher.Variable();
    const typesExpr = new Cypher.ListComprehension(l)
      .in(Cypher.labels(eNode))
      .where(Cypher.neq(l, new Cypher.Literal(ENTITY_LABEL_NAME)));

    const propsExpr = Cypher.properties(eNode);
    const keysExpr = new Cypher.List([new Cypher.Literal(this.ENTITY_KEY_PROPERTY), new Cypher.Literal(ENTITY_NAME_PROPERTY)]);
    const cleanedProps = new Cypher.Function('apoc.map.removeKeys', [propsExpr, keysExpr]);

    const [clause, collections] = await this.collectionService.getCollectionsOfEntityNode(eNode, query);

    const returnMap = new Cypher.Map({
      nodeLabel: new Cypher.Literal(ENTITY_LABEL_NAME),
      types: typesExpr,
      label: eNode.property(ENTITY_NAME_PROPERTY),
      id: eNode.property(this.ENTITY_KEY_PROPERTY),
      properties: cleanedProps,
      collections: collections,
    });

    return clause.return([returnMap, 'entity']);
  }

  async find(queryParams: EntitySearchDto): Promise<EntityCollectionNameDto[]> {
    const eNode = new Cypher.Node();
    const score = new Cypher.Variable();

    const searchPattern = await this.runSearch(eNode, score, queryParams.label);
    let collPattern: undefined | Pattern = undefined;

    if (queryParams.collectionFilter && Object.keys(queryParams.collectionFilter).length > 0) {
      collPattern = this.addFilterByCollection(eNode, queryParams.collectionFilter);
    }

    let typePatten: undefined | Pattern = undefined;

    if (queryParams.types) {
      typePatten = this.addFilterByTypes(eNode, queryParams.types);
    }

    let query = searchPattern;

    query = await this.addOrderByProperty(query, eNode, [[score, 'ASC']]);

    if (typePatten) {
      query = query.with(eNode, score).match(typePatten).with(eNode, score).distinct();
    }

    // Wenn ein Collection-Filter existiert, erweitern wir den Query mit MATCH
    if (collPattern) {
      query = query.with(eNode, score).match(collPattern).with(eNode, score).distinct();
    }

    // // Rückgabe als Liste
    // const collectReturnMap = Cypher.collect(returnMap);
    // const returnClause = new Cypher.Return([collectReturnMap, "entities"]);

    // Finaler Query
    const clause = await this.entityReturnMap(eNode, query);

    const { cypher, params } = clause.build();
    const res = await this.neo4jService.read<{
      entity: EntityCollectionNameDto;
    }>(cypher, params);
    const entities: EntityCollectionNameDto[] = res.records.map((record) => {
      return record.get('entity');
    });

    return entities;
  }

  private addFilterByCollection(eNode: Cypher.Node, collectionFilters: Record<string, string[]>) {
    const collectionChains = this.model.getCollectionChains();
    const collectionChain = collectionChains.find((chain) => {
      let match = false;
      Object.keys(collectionFilters).forEach((key) => {
        match = chain.includes(key);
      });
      return match;
    });

    if (!collectionChain) {
      this.logger.error("CollectionChain doesn't exist");
      throw new RAMENError("CollectionChain doesn't exist");
    }

    const colIdLabel = this.model.getNodeKeyField(COLLECTION_LABEL_NAME);

    const aNode = new Cypher.Node();

    const eToA = new Cypher.Relationship();
    const aToC = new Cypher.Relationship();

    let newPattern: Pattern | PartialPattern = new Cypher.Pattern(eNode)
      .related(eToA, { type: FROM_ANNOTATION_REL_TYPE, direction: 'left' })
      .to(aNode, { labels: ANNOTATION_LABEL_NAME })
      .related(aToC, { type: TO_ANNOTATION_REL_TYPE, direction: 'left' });

    const collections: Map<string, Cypher.Node> = new Map<string, Cypher.Node>();

    collectionChain.toReversed().forEach((col, index) => {
      const collection = new Cypher.Node();
      const partOf = new Cypher.Relationship();

      if ('to' in newPattern) {
        newPattern = newPattern.to(collection, { labels: col });
      }

      if (index !== collectionChain.length - 1) {
        newPattern = newPattern.related(partOf, {
          type: 'PART_OF',
          direction: 'right',
        });
      }

      collections.set(col, collection);
    });

    for (const collection in collectionFilters) {
      const col = collections.get(collection);
      if (!col) continue;
      const colIDs = collectionFilters[collection];

      if (colIDs !== undefined) {
        newPattern = newPattern.where(Cypher.in(col.property(colIdLabel), new Cypher.Literal(colIDs)));
      }
    }

    return newPattern as unknown as Pattern;
  }

  private addFilterByTypes(eNode: Cypher.Node, types: string[]) {
    const modelTypes = this.model.getSubtypes(ENTITY_LABEL_NAME);

    types.forEach((type) => {
      if (!modelTypes.includes(type)) {
        throw new RAMENError(`Unsupported type ${type}`);
      }
    });

    const labelConditions = types.map((type) => eNode.hasLabel(type));
    const orCondition = Cypher.or(...labelConditions);

    const pattern = new Cypher.Pattern(eNode).where(orCondition);

    return pattern;
  }

  private async addOrderByProperty<T extends Cypher.With | Cypher.Return>(
    pattern: T,
    eNode: Cypher.Node,
    variables: [Cypher.Variable, 'DESC' | 'ASC'][],
  ): Promise<T> {
    const guidelines = await this.guidelinesService.get();
    const orderBy = guidelines.scenarios.searchEntities.orderBy;
    const orderByArr: [Cypher.Expr, Cypher.Order][] = orderBy.map((value) => {
      return [eNode.property(value.property), value.order];
    });

    return pattern.orderBy(...variables, ...orderByArr) as T;
  }

  /**
   * Creates a new node of the given type with the provided properties.
   *
   * Validates all attributes against the model before writing to the database.
   * A UUID key is automatically generated and must not be provided manually.
   *
   * @param type - The node type name as defined in the GModel (e.g. `"Entity"`, `"Person"`)
   * @param properties - Key-value pairs of the node's attributes (excluding the key field)
   *
   * @returns The generated UUID of the newly created node
   *
   * @throws {Error} `"Invalid Attributes"` – if attribute validation fails.
   *                 `error.cause` contains the list of validation messages (`string[]`)
   *
   * @example
   * const id = await service.create("Entity", { label: "Napoleon Bonaparte" });
   */
  async create(type: string, properties: Record<string, unknown>) {
    const nodeType = this.model.getNodeType(type);

    const [valid, message]: [valid: boolean, message: string[]] = this.model.validateAttributes(nodeType, properties);

    if (!valid) {
      throw new Error('Invalid Attributes', { cause: message });
    }

    const key = this.model.getNodeKeyField(type);

    const nodeLabels = Array.from(nodeType.superTypes.values());
    nodeLabels.push(type);

    const nodeProperties: Record<string, Cypher.Expr> = {};
    Object.entries(properties).forEach(([key, value]) => {
      nodeProperties[key] = new Cypher.Param(value);
    });
    nodeProperties[key] = Cypher.randomUUID();

    const eNode = new Cypher.Node();
    const pattern = new Cypher.Pattern(eNode, {
      labels: nodeLabels,
      properties: nodeProperties,
    });
    const { cypher, params } = new Cypher.Create(pattern)
      .set(...metadataForNewNode(eNode))
      .return([eNode.property(key), 'id'])
      .build();
    const res = await this.neo4jService.write<{ id: string }>(cypher, params);
    return res.records[0].get('id');
  }

  async update(id: string, properties: Record<string, unknown>) {
    const entityNode = await this.nodes.getById(id, {
      labels: ENTITY_LABEL_NAME,
    });

    if (!entityNode) {
      throw new Error('There is no entity with the given Id.');
    }

    const nodeType = this.model.getMostSpecificType(entityNode.labels);

    const [valid, message]: [valid: boolean, message: string[]] = this.model.validateAttributes(nodeType, properties);

    if (!valid) {
      throw new Error('Invalid Attributes', { cause: message });
    }

    const key = this.model.getNodeKeyField(nodeType.name);

    const eNode = new Cypher.Node();

    const nodeProperties: SetParam[] = [];
    Object.entries(properties).forEach(([key, value]) => {
      nodeProperties.push([eNode.property(key), new Cypher.Param(value)]);
    });

    const pattern = new Cypher.Pattern(eNode, {
      properties: {
        [key]: new Cypher.Param(id),
      },
    });
    const { cypher, params } = new Cypher.Match(pattern)
      .set(...nodeProperties)
      .set(...metadataForUpdateNode(eNode))
      .return([eNode.property(key), 'id'])
      .build();
    const res = await this.neo4jService.write<{ id: string }>(cypher, params);
    return res.records[0].get('id');
  }

  async delete(id: string) {
    const key = this.model.getNodeKeyField(ENTITY_LABEL_NAME);
    const eNode = new Cypher.Node();
    const pattern = new Cypher.Pattern(eNode, {
      labels: ENTITY_LABEL_NAME,
      properties: {
        [key]: new Cypher.Param(id),
      },
    });
    const { cypher, params } = new Cypher.Match(pattern)
      .detachDelete(eNode) //TODO: auch annotation properties löschen, die keine weiterne verknüpfungen haben?
      .build();
    await this.neo4jService.write(cypher, params);
  }

  private async createSearchFulltextIndex() {
    const guidelines = await this.guidelinesService.get();
    const searchIndex = guidelines.fulltextIndexes.search;
    await this.neo4jService.write(
      `CREATE FULLTEXT INDEX ${searchIndex} IF NOT EXISTS FOR (n:${ENTITY_LABEL_NAME}) ON EACH [n.${ENTITY_NAME_PROPERTY}]`,
    );
    this.logger.log(`Successfully created FULLTEXT INDEX ${searchIndex}`);
  }
}
