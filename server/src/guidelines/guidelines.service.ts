import { Injectable } from '@nestjs/common';
import guidelinesJSON from '../../guidelines.json';
import { IGuidelines } from '../../shared/IGuidelines';
import { EmConfig } from './interfaces/em-config.interface';
import { RamenModelService } from '../schema/ramen-model.service';
import { ANNOTATION_LABEL_NAME, ENTITY_LABEL_NAME } from '../constants';
import { RelationType } from '../schema/interfaces/relation-type.interface';
import { NodeType } from '../schema/interfaces/node-type.interface';

@Injectable()
export class GuidelinesService {
  constructor(private readonly model: RamenModelService) {}

  // eslint-disable-next-line
  async get(): Promise<IGuidelines> {
    return guidelinesJSON as IGuidelines;
  }

  getConfig(): EmConfig {
    return {
      collectionChains: this.model.getCollectionChains(),
      entityTypes: this.model.getSubtypes(ENTITY_LABEL_NAME),
      annotationTypes: this.getAnnotationTypes(),
      dataTypes: this.model.getDataTypes(),
    } satisfies EmConfig;
  }

  getEntityProperties(type: string) {
    const node = this.model.getNodeType(type);
    return node.attributes.filter((attribute) => !attribute.isKey);
  }

  /**
   *  TODO: Aufgrund der funktionsweise von "getRelationTypesOfNode()" bekommt man hier aktuell nur die Relation Types von der obersten Annotation Node. und nicht von allen Subtypes. Das ist aber eigentlich gewünscht
   */
  private getAnnotationTypes(): string[] {
    const annotationType = this.model.getNodeType(ANNOTATION_LABEL_NAME);
    const entityType = this.model.getNodeType(ENTITY_LABEL_NAME);

    return this.model
      .getRelationTypesOfNode(ANNOTATION_LABEL_NAME)
      .filter((relation) =>
        this.isEntityAnnotationRelation(relation, entityType),
      )
      .map((relation) => this.getAnnotationTypeName(relation, annotationType));
  }

  private isEntityAnnotationRelation(
    relation: RelationType,
    entityType: NodeType,
  ): boolean {
    return (
      this.isEntityOrSubtype(relation.from.nodeId, entityType) ||
      this.isEntityOrSubtype(relation.to.nodeId, entityType)
    );
  }

  private isEntityOrSubtype(nodeTypeId: string, entityType: NodeType): boolean {
    const nodeType = this.model.getNodeTypeById(nodeTypeId);

    return (
      nodeType.id === entityType.id ||
      this.model.isSubtypeOf(nodeType.name, entityType.name)
    );
  }

  private getAnnotationTypeName(
    relation: RelationType,
    annotationType: NodeType,
  ): string {
    const oppositeNodeId =
      relation.to.nodeId === annotationType.id
        ? relation.to.nodeId
        : relation.from.nodeId;

    return this.model.getNodeTypeById(oppositeNodeId).name;
  }
}
