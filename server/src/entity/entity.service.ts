import { Injectable } from "@nestjs/common";
import { Neo4jService } from "../neo4j/neo4j.service";
import { GuidelinesService } from "../guidelines/guidelines.service";
import { EntityDto } from "./dto/entity.dto";
import { EntityNamesDto } from "./dto/entity-names.dto";


@Injectable()
export class EntityService {

  constructor(private readonly neo4jService: Neo4jService, private readonly guidelinesService: GuidelinesService) {}

  /**
   * Finds a single Entity node by its {@link idLabel}
   *
   * @param id The {@link idLabel} of the Entity node.
   * @returns A promise that resolves to the found Entity node (IEntity) or `null` if no Entity matches the given id.
   */
  async findOneById(id: string): Promise<EntityDto|null> {
    const guidelines = await this.guidelinesService.get();

    const res = await this.neo4jService.read<{ entity: EntityDto  }>(
      `
      MATCH (n:${guidelines.entity.metaType} {${guidelines.entity.idLabel}: $id}) 
      RETURN {
        nodeLabel: '${guidelines.entity.metaType}',
        types: [l IN labels(n) WHERE l <> '${guidelines.entity.metaType}'],
        id: n.${guidelines.entity.idLabel},
        properties: apoc.map.removeKeys(properties(n), ['${guidelines.entity.idLabel}', '${guidelines.entity.nameLabel}'])
      } AS entity;`,
      { id: id },
    );

    if (res.records.length !== 1) {
      return null;
    }

    const entityNode = res.records[0].get('entity');

    return entityNode;
  }

  async findByName(name: string): Promise<EntityDto[]> {
    const guidelines = await this.guidelinesService.get();

    const res = await this.neo4jService.read<{ entities: EntityDto[] }>(
      `
      CALL db.index.fulltext.queryNodes("${guidelines.fulltextIndexes.search}", $query) YIELD node AS n, score
      WITH n, score
      ORDER BY score DESC
      RETURN collect({
        nodeLabel: '${guidelines.entity.metaType}',
        types: [l IN labels(n) WHERE l <> '${guidelines.entity.metaType}'],
        id: n.${guidelines.entity.idLabel},
        properties: apoc.map.removeKeys(properties(n), ['${guidelines.entity.idLabel}', '${guidelines.entity.nameLabel}'])
      }) AS entities;`,
      { query: name },
    );


    const entities = res.records[0].get('entities');

    return entities;
  }

  async findNamesByName(name: string): Promise<EntityNamesDto[]> {
    const guidelines = await this.guidelinesService.get();

    const res = await this.neo4jService.read<{ label: string, id: string }>(
      `
      CALL db.index.fulltext.queryNodes("${guidelines.fulltextIndexes.search}", $query) YIELD node, score
      WITH DISTINCT node as n, score
      RETURN n.${guidelines.entity.nameLabel} AS label, n.${guidelines.entity.idLabel} AS id ORDER BY score DESC, n.numberOfChilds DESC, n.pathLength ASC;`,
      { query: name },
    );


    const entities = res.records.map(record => ({
      label: record.get('label'),
      id: record.get('id'),
    }));

    return entities;
  }
}
