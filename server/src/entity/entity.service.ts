import { Injectable } from "@nestjs/common";
import { Neo4jService } from "../neo4j/neo4j.service";
import { GuidelinesService } from "../guidelines/guidelines.service";
import { EntityDto } from "./dto/entity.dto";
import { EntityNamesDto } from "./dto/entity-names.dto";
import Cypher, {
  PartialPattern,
  Pattern,
} from "@neo4j/cypher-builder";
import { EntitySearchDto } from "./dto/entity-search.dto";
import { EntityCollectionNameDto } from "./dto/entity-collection-name.dto";
import { CollectionService } from "../collection/collection.service";

@Injectable()
export class EntityService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly guidelinesService: GuidelinesService,
    private readonly collectionService: CollectionService,
  ) {}

  /**
   * Finds a single Entity node by its {@link idLabel}
   *
   * @param id The {@link idLabel} of the Entity node.
   * @returns A promise that resolves to the found Entity node (IEntity) or `null` if no Entity matches the given id.
   */
  async findOneById(id: string): Promise<EntityDto | null> {
    const guidelines = await this.guidelinesService.get();

    const eNode = new Cypher.Node();

    const pattern = new Cypher.Pattern(eNode, {
      labels: guidelines.entity.metaType,
      properties: {
        [guidelines.entity.idLabel]: new Cypher.Param(id),
      },
    });

    let clause: Cypher.Clause = new Cypher.Match(pattern);
    clause = await this.entityReturnMap(eNode, clause);

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{
      entity: EntityCollectionNameDto;
    }>(cypher, params);

    if (res.records.length !== 1) {
      return null;
    }

    const entityNode = res.records[0].get("entity");

    return entityNode;
  }

  async findByName(name: string): Promise<EntityDto[]> {
    const eNode = new Cypher.Node();
    const score = new Cypher.Variable();

    const searchPattern = await this.runSearch(eNode, score, name);
    const subQuery = await this.entityReturnMap(
      eNode,
      searchPattern.orderBy([score, "DESC"]),
    );

    const collectReturnMap = new Cypher.Collect(subQuery);

    const clause = new Cypher.With("*").return([collectReturnMap, "entities"]);

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{
      entities: EntityCollectionNameDto[];
    }>(cypher, params);

    const entities = res.records[0].get("entities");

    return entities;
  }

  async findNamesByName(name: string): Promise<EntityNamesDto[]> {
    const guidelines = await this.guidelinesService.get();

    const eNode = new Cypher.Node();
    const score = new Cypher.Variable();

    const searchPattern = await this.runSearch(eNode, score, name);

    let clause = searchPattern
      .return(
        [eNode.property(guidelines.entity.nameLabel), "label"],
        [eNode.property(guidelines.entity.idLabel), "id"],
      );

      clause = await this.addOrderByProperty(clause, eNode, [[score, "ASC"]]);

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{ label: string; id: string }>(
      cypher,
      params,
    );

    const entities = res.records.map((record) => ({
      label: record.get("label"),
      id: record.get("id"),
    }));

    return entities;
  }

  private async runSearch(
    eNode: Cypher.Node,
    score: Cypher.Variable,
    query: string,
  ) {
    const guidelines = await this.guidelinesService.get();

    return new Cypher.With("*")
      .callProcedure(
        Cypher.db.index.fulltext.queryNodes(
          guidelines.fulltextIndexes.search,
          new Cypher.Literal(query),
        ),
      )
      .yield(["node", eNode], ["score", score])
      .with(eNode, score);
  }

  private async entityReturnMap(eNode: Cypher.Node, query) {
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
    const cleanedProps = new Cypher.Function("apoc.map.removeKeys", [
      propsExpr,
      keysExpr,
    ]);

    const [clause, collections] = await this.collectionService.getCollectionsOfEntityNode(eNode, query);

    const returnMap = new Cypher.Map({
      nodeLabel: new Cypher.Literal(guidelines.entity.metaType),
      types: typesExpr,
      label: eNode.property(guidelines.entity.nameLabel),
      id: eNode.property(guidelines.entity.idLabel),
      properties: cleanedProps,
      collections: collections
    });

    return clause.return([returnMap, "entity"]);

  }

  async find(queryParams: EntitySearchDto): Promise<EntityCollectionNameDto[]> {
    const eNode = new Cypher.Node();
    const score = new Cypher.Variable();

    let searchPattern = await this.runSearch(eNode, score, queryParams.label);
    let collPattern;

    if (
      queryParams.collectionFilter &&
      Object.keys(queryParams.collectionFilter).length > 0
    ) {
      collPattern = await this.addFilterByCollection(
        eNode,
        queryParams.collectionFilter,
      );
    }

    let typePatten;

    if (queryParams.types) {
      typePatten = await this.addFilterByTypes(eNode, queryParams.types);
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
      return record.get("entity");
    })

    return entities;
  }

  private async addFilterByCollection(
    eNode: Cypher.Node,
    collectionFilters: Record<string, string[]>,
  ) {
    const guidelines = await this.guidelinesService.get();
    const collectionChain =
      guidelines.scenarios.findByCollection.collectionChain;
    const filterableCollections =
      guidelines.scenarios.findByCollection.filterable;
    const colIdLabel = guidelines.collection.idLabel;

    const aNode = new Cypher.Node();

    const eToA = new Cypher.Relationship();
    const aToC = new Cypher.Relationship();

    let newPattern: Pattern | PartialPattern = new Cypher.Pattern(eNode)
      .related(eToA, { type: "REFERS_TO", direction: "left" })
      .to(aNode, { labels: "Annotation" })
      .related(aToC, { type: "HAS_ANNOTATION", direction: "left" });

    const collections: Map<string, Cypher.Node> = new Map<
      string,
      Cypher.Node
    >();

    collectionChain.forEach((col, index) => {
      const collection = new Cypher.Node();
      const partOf = new Cypher.Relationship();

      if ("to" in newPattern) {
        newPattern = newPattern.to(collection, { labels: col });
      }

      if (index !== collectionChain.length - 1) {
        newPattern = newPattern.related(partOf, {
          type: "PART_OF",
          direction: "right",
        });
      }

      collections.set(col, collection);
    });

    filterableCollections.forEach((collection, index) => {
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

  private async addFilterByTypes(eNode: Cypher.Node, types: string[]) {
    const labelConditions = types.map((type) => eNode.hasLabel(type));
    const orCondition = Cypher.or(...labelConditions);

    const pattern = new Cypher.Pattern(eNode).where(orCondition);

    return pattern;
  }

  private async addOrderByProperty<
    T extends Cypher.With | Cypher.Return
  >(
    pattern: T,
    eNode: Cypher.Node,
    variables: [Cypher.Variable, "DESC" | "ASC"][],
  ): Promise<T> {
    const guidelines = await this.guidelinesService.get();
    const orderBy = guidelines.scenarios.searchEntities.orderBy;
    const orderByArr: [Cypher.Expr, Cypher.Order][] = orderBy
      .map((value) => {
        return [eNode.property(value.property), value.order];
      })

    return pattern.orderBy(...variables, ...orderByArr) as T;
  }
}
