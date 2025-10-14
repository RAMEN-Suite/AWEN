import { Injectable } from "@nestjs/common";
import { Neo4jService } from "../neo4j/neo4j.service";
import { GuidelinesService } from "../guidelines/guidelines.service";
import { EntityDto } from "./dto/entity.dto";
import { EntityNamesDto } from "./dto/entity-names.dto";
import Cypher from "@neo4j/cypher-builder";
import { EntitySearchDto } from "./dto/entity-search.dto";

@Injectable()
export class EntityService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly guidelinesService: GuidelinesService,
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

    const returnMap = await this.entityReturnMap(eNode);

    const clause = new Cypher.Match(pattern).return([returnMap, "entity"]);

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{ entity: EntityDto }>(
      cypher,
      params,
    );

    if (res.records.length !== 1) {
      return null;
    }

    const entityNode = res.records[0].get("entity");

    return entityNode;
  }

  async findByName(name: string): Promise<EntityDto[]> {
    const eNode = new Cypher.Node();
    const score = new Cypher.Variable();

    const returnMap = await this.entityReturnMap(eNode);

    const searchPattern = await this.runSearch(eNode, score, name);
    const subQuery = searchPattern.orderBy([score, "DESC"]).return(returnMap);

    const collectReturnMap = new Cypher.Collect(subQuery);

    const clause = new Cypher.With("*").return([collectReturnMap, "entities"]);

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{ entities: EntityDto[] }>(
      cypher,
      params,
    );

    const entities = res.records[0].get("entities");

    return entities;
  }

  async findNamesByName(name: string): Promise<EntityNamesDto[]> {
    const guidelines = await this.guidelinesService.get();

    const eNode = new Cypher.Node();
    const score = new Cypher.Variable();

    const searchPattern = await this.runSearch(eNode, score, name);

    const clause = searchPattern
      .return(
        [eNode.property(guidelines.entity.nameLabel), "label"],
        [eNode.property(guidelines.entity.idLabel), "id"],
      )
      .orderBy([score, "ASC"], [eNode.property("pathLength"), "ASC"]);

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

  private async entityReturnMap(eNode: Cypher.Node) {
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

    return new Cypher.Map({
      nodeLabel: new Cypher.Literal(guidelines.entity.metaType),
      types: typesExpr,
      id: eNode.property(guidelines.entity.idLabel),
      properties: cleanedProps,
    });
  }

  async find(queryParams: EntitySearchDto) {
    const guidelines = await this.guidelinesService.get();

    const eNode: Cypher.Node = new Cypher.Node();

    let pattern: Cypher.Pattern = new Cypher.Pattern(eNode, {
      labels: guidelines.entity.metaType,
    });

    if (queryParams.collectionFilter && Object.keys(queryParams.collectionFilter).length > 0) {
      pattern = await this.addFilterByCollection(pattern, queryParams.collectionFilter);
    }

    const returnMap = await this.entityReturnMap(eNode);
    const subQuery = new Cypher.Match(pattern).return(returnMap);
    const collectReturnMap = new Cypher.Collect(subQuery);

    const clause = new Cypher.With("*").return([collectReturnMap, "entities"]);

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{ entities: EntityDto[] }>(
      cypher,
      params,
    );

    const entities = res.records[0].get("entities");

    return entities;

  }

  private async addFilterByCollection(pattern: Cypher.Pattern, collectionFilters: Record<string, string[]>) {
    const guidelines = await this.guidelinesService.get();
    const collectionChain =
      guidelines.scenarios.findByCollection.collectionChain;
    const filterableCollections =
      guidelines.scenarios.findByCollection.filterable;
    const colIdLabel = guidelines.collection.idLabel;

    const aNode = new Cypher.Node();

    const eToA = new Cypher.Relationship();
    const aToC = new Cypher.Relationship();

    const newPattern = pattern
      .related(eToA, { type: "REFERS_TO", direction: "left" })
      .to(aNode)
      .related(aToC, { type: "HAS_ANNOTATION", direction: "left" });

    const collections: Map<string, Cypher.Node> = new Map<string, Cypher.Node>()

    collectionChain.forEach((col, index) => {
      const collection = new Cypher.Node();
      const partOf = new Cypher.Relationship();

      if (index !== collectionChain.length - 1) {
        ((newPattern as unknown) as Cypher.Pattern).related(partOf, { type: "PART_OF", direction: "left" });
      } else {
        newPattern
          .to(collection, { labels: col })
          .related(partOf, { type: "PART_OF", direction: "left" });
      }

      collections.set(col, collection);
    });

    filterableCollections.forEach((collection, index) => {
      const col = collections.get(collection)!;
      const colIDs = collectionFilters[collection];

      newPattern.where(Cypher.in(col.property(colIdLabel), new Cypher.Literal(colIDs)))
    });

    return ((newPattern as unknown) as Cypher.Pattern);

  }
}
