import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "../neo4j/neo4j.service";
import { GuidelinesService } from "../guidelines/guidelines.service";
import { EntityModel } from "./models/entity.model";

@Injectable()
export class EntityService {

  constructor(private readonly neo4jService: Neo4jService, private readonly guidelinesService: GuidelinesService) {}

  /**
   * Finds a single Entity node by its {@link idLabel}
   *
   * @param id The {@link idLabel} of the Entity node.
   * @returns A promise that resolves to the found Entity node (IEntity).
   * @throws NotFoundException If the Entity node is not found or if more than one node with the {@link idLabel} exists.
   */
  async findOneById(id: string): Promise<EntityModel> {
    const guidelines = await this.guidelinesService.get();

    const res = await this.neo4jService.read<{ entity: EntityModel }>(
      `
      MATCH (n:${guidelines.entity.nodeLabel} {${guidelines.entity.idLabel}: $id}) 
      RETURN {
        nodeLabel: '${guidelines.entity.nodeLabel}',
        types: [l IN labels(n) WHERE l <> '${guidelines.entity.nodeLabel}'],
        id: n.${guidelines.entity.idLabel},
        properties: apoc.map.removeKeys(properties(n), ['${guidelines.entity.idLabel}'])
      } AS entity;`,
      { id: id },
    );

    if (res.records.length != 1) {
      throw new NotFoundException('Entity was not found!');
    }

    const entityNode = res.records[0].get('entity');

    return entityNode;
  }
}
