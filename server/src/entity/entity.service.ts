import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import { GuidelinesService } from '../guidelines/guidelines.service';
import { EntityNamesDto } from './dto/entity-names.dto';
import Cypher, { PartialPattern, Pattern } from '@neo4j/cypher-builder';
import { EntitySearchDto } from './dto/entity-search.dto';
import { EntityCollectionNameDto } from './dto/entity-collection-name.dto';
import { CollectionService } from '../collection/collection.service';
import { EntityAutocompleteQueryDto } from './dto/entity-autocomplete-query.dto';
import { RamenModelService } from '../schema/ramen-model.service';
import { NodeRepository } from '../graph/node-repository.service';
import { EntityNodeDto } from './dto/entity-node.dto';
import {
  transformNodesToEntityNodeDTOs,
  transformNodesToNameEntityDTOs,
  transformNodeToEntityDTO,
} from '../utils/node-transformers';
import { Integer, Node } from 'neo4j-driver';
import {
  ANNOTATION_LABEL_NAME,
  COLLECTION_LABEL_NAME,
  ENTITY_LABEL_NAME,
} from '../constants';
import { EntityDto } from './dto/entity.dto';

@Injectable()
export class EntityService {
  logger = new Logger(EntityService.name);

  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly guidelinesService: GuidelinesService,
    private readonly collectionService: CollectionService,
    private readonly model: RamenModelService,
    private readonly nodes: NodeRepository,
  ) {}

  async getById(id: string): Promise<EntityDto | undefined> {
    const entityNode: Node<Integer, Record<string, any>> | undefined =
      await this.nodes.getById(id, {
        labels: ENTITY_LABEL_NAME,
        keyName: this.model.getNodeKeyField(ENTITY_LABEL_NAME),
      });
    if (!entityNode) return undefined;

    const gNode = this.model.getMostSpecificType(entityNode.labels);
    if (!gNode) return undefined;

    return transformNodeToEntityDTO(entityNode, gNode);
  }

  async getByProperty(key: string, value: string): Promise<EntityNodeDto[]> {
    const entityNodes: Node<Integer, Record<string, any>>[] =
      await this.nodes.getByProperty(key, value, {
        labels: ENTITY_LABEL_NAME,
      });

    // TODO: zum normalen DTO
    return transformNodesToEntityNodeDTOs(entityNodes);
  }

  async findNamesByNameNew(name: string): Promise<EntityNamesDto[]> {
    const { fulltextIndexes } = await this.guidelinesService.get();
    const results = await this.nodes.indexFulltextQueryNodes(
      fulltextIndexes.search,
      name,
    );
    const id = this.model.getNodeKeyField(ENTITY_LABEL_NAME);
    const label = this.model.getAttribute(ENTITY_LABEL_NAME, 'label');

    if (!id) {
      this.logger.error('There is no id field for entity nodes.');
      throw new Error('There is no id field for entity nodes.');
    }
    if (!label) {
      this.logger.error('There is no param named "Label" for entity nodes."');
      throw new Error('There is no param named "Label" for entity nodes."');
    }
    return transformNodesToNameEntityDTOs(
      results.map((r) => r.node),
      label.name,
      id,
    );
  }

  async findNamesByName(
    name: string,
    queryParams: EntityAutocompleteQueryDto,
  ): Promise<EntityNamesDto[]> {
    const guidelines = await this.guidelinesService.get();

    const eNode = new Cypher.Node();
    const score = new Cypher.Variable();

    const searchPattern = await this.runSearch(eNode, score, name);

    let collPattern: undefined | Pattern = undefined;

    if (
      queryParams.collectionFilter &&
      Object.keys(queryParams.collectionFilter).length > 0
    ) {
      collPattern = await this.addFilterByCollection(
        eNode,
        queryParams.collectionFilter,
      );
    }

    let typePatten: undefined | Pattern = undefined;

    if (queryParams.types) {
      typePatten = this.addFilterByTypes(eNode, queryParams.types);
    }

    let query = searchPattern;

    query = await this.addOrderByProperty(query, eNode, [[score, 'ASC']]);

    if (typePatten) {
      query = query
        .with(eNode, score)
        .match(typePatten)
        .with(eNode, score)
        .distinct();
    }

    // Wenn ein Collection-Filter existiert, erweitern wir den Query mit MATCH
    if (collPattern) {
      query = query
        .with(eNode, score)
        .match(collPattern)
        .with(eNode, score)
        .distinct();
    }

    query = await this.addOrderByProperty(query, eNode, [[score, 'ASC']]);

    const { cypher, params } = query
      .return(
        [eNode.property(guidelines.entity.nameLabel), 'label'],
        [eNode.property(guidelines.entity.idLabel), 'id'],
      )
      .build();

    const res = await this.neo4jService.read<{ label: string; id: string }>(
      cypher,
      params,
    );

    const entities = res.records.map((record) => ({
      label: record.get('label'),
      id: record.get('id'),
    }));

    return entities;
  }

  private async runSearch(
    eNode: Cypher.Node,
    score: Cypher.Variable,
    query: string,
  ) {
    const guidelines = await this.guidelinesService.get();

    return new Cypher.With('*')
      .callProcedure(
        Cypher.db.index.fulltext.queryNodes(
          guidelines.fulltextIndexes.search,
          new Cypher.Literal(query),
        ),
      )
      .yield(['node', eNode], ['score', score])
      .with(eNode, score);
  }

  private async entityReturnMap(eNode: Cypher.Node, query: Cypher.With) {
    const guidelines = await this.guidelinesService.get();

    const l = new Cypher.Variable();
    const typesExpr = new Cypher.ListComprehension(l)
      .in(Cypher.labels(eNode))
      .where(Cypher.neq(l, new Cypher.Literal(guidelines.entity.metaType)));

    const propsExpr = Cypher.properties(eNode);
    const keysExpr = new Cypher.List([
      new Cypher.Literal(guidelines.entity.idLabel),
      new Cypher.Literal(guidelines.entity.nameLabel),
    ]);
    const cleanedProps = new Cypher.Function('apoc.map.removeKeys', [
      propsExpr,
      keysExpr,
    ]);

    const [clause, collections] =
      await this.collectionService.getCollectionsOfEntityNode(eNode, query);

    const returnMap = new Cypher.Map({
      nodeLabel: new Cypher.Literal(guidelines.entity.metaType),
      types: typesExpr,
      label: eNode.property(guidelines.entity.nameLabel),
      id: eNode.property(guidelines.entity.idLabel),
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

    if (
      queryParams.collectionFilter &&
      Object.keys(queryParams.collectionFilter).length > 0
    ) {
      collPattern = await this.addFilterByCollection(
        eNode,
        queryParams.collectionFilter,
      );
    }

    let typePatten: undefined | Pattern = undefined;

    if (queryParams.types) {
      typePatten = this.addFilterByTypes(eNode, queryParams.types);
    }

    let query = searchPattern;

    query = await this.addOrderByProperty(query, eNode, [[score, 'ASC']]);

    if (typePatten) {
      this.logger.debug('typePatten', typePatten.toString());
      query = query
        .with(eNode, score)
        .match(typePatten)
        .with(eNode, score)
        .distinct();
    }

    // Wenn ein Collection-Filter existiert, erweitern wir den Query mit MATCH
    if (collPattern) {
      query = query
        .with(eNode, score)
        .match(collPattern)
        .with(eNode, score)
        .distinct();
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

  private async addFilterByCollection(
    eNode: Cypher.Node,
    collectionFilters: Record<string, string[]>,
  ) {
    const guidelines = await this.guidelinesService.get();
    const collectionChains = this.model.getCollectionChains();
    this.logger.debug(collectionChains);
    const collectionChain = collectionChains.find((chain) => {
      let match = false;
      Object.keys(collectionFilters).forEach((key) => {
        match = chain.includes(key);
      });
      return match;
    });

    if (!collectionChain) {
      this.logger.error("CollectionChain doesn't exist");
      throw new Error("CollectionChain doesn't exist");
    }

    const filterableCollections =
      guidelines.scenarios.findByCollection.filterable;
    const colIdLabel = this.model.getNodeKeyField(COLLECTION_LABEL_NAME);

    const aNode = new Cypher.Node();

    const eToA = new Cypher.Relationship();
    const aToC = new Cypher.Relationship();

    let newPattern: Pattern | PartialPattern = new Cypher.Pattern(eNode)
      .related(eToA, { type: 'REFERS_TO', direction: 'left' })
      .to(aNode, { labels: ANNOTATION_LABEL_NAME })
      .related(aToC, { type: 'HAS_ANNOTATION', direction: 'left' });

    const collections: Map<string, Cypher.Node> = new Map<
      string,
      Cypher.Node
    >();

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

    filterableCollections.forEach((collection) => {
      const col = collections.get(collection)!;
      const colIDs = collectionFilters[collection];

      if (colIDs !== undefined) {
        newPattern = newPattern.where(
          Cypher.in(col.property(colIdLabel), new Cypher.Literal(colIDs)),
        );
      }
    });

    return newPattern as unknown as Pattern;
  }

  private addFilterByTypes(eNode: Cypher.Node, types: string[]) {
    const modelTypes = this.model.getSubtypes(ENTITY_LABEL_NAME);

    types.forEach((type) => {
      if (!modelTypes.includes(type)) {
        throw new Error(`Unsupported type ${type}`);
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
}
