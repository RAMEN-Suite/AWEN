import { Injectable } from "@nestjs/common";
import { Neo4jService } from "../neo4j/neo4j.service";
import { GuidelinesService } from "../guidelines/guidelines.service";
import { EntityDto } from "./dto/entity.dto";
import { EntityNamesDto } from "./dto/entity-names.dto";
import Cypher from "@neo4j/cypher-builder";

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
    const subQuery = searchPattern
      .orderBy([score, 'DESC'])
      .return(returnMap);

    const collectReturnMap = new Cypher.Collect(subQuery);

    const clause = new Cypher.With("*").return([collectReturnMap, "entities"]);

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{ entities: EntityDto[] }>(cypher, params);

    const entities = res.records[0].get("entities");

    return entities;
  }

  async findNamesByName(name: string): Promise<EntityNamesDto[]> {
    const guidelines = await this.guidelinesService.get();

    const eNode = new Cypher.Node();
    const score = new Cypher.Variable();

    const searchPattern = await this.runSearch(eNode, score, name);

    const clause = searchPattern
      .return([eNode.property(guidelines.entity.nameLabel), 'label'], [eNode.property(guidelines.entity.idLabel), 'id'])
      .orderBy([score, 'ASC'], [eNode.property('pathLength'), 'ASC']);

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{ label: string; id: string }>(cypher, params);

    const entities = res.records.map((record) => ({
      label: record.get("label"),
      id: record.get("id"),
    }));

    return entities;
  }



  private async runSearch(eNode: Cypher.Node, score: Cypher.Variable, query: string) {
    const guidelines = await this.guidelinesService.get();

    return new Cypher.With("*")
      .callProcedure(Cypher.db.index.fulltext.queryNodes(guidelines.fulltextIndexes.search, new Cypher.Literal(query))).yield(['node', eNode], ['score', score]).with(eNode, score);
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
}
