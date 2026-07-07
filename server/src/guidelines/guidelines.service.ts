import { Injectable } from '@nestjs/common';
import guidelinesJSON from '../../guidelines.json';
import { IGuidelines } from '../../shared/IGuidelines';
import { EmConfig } from './interfaces/em-config.interface';
import { RamenModelService } from '../schema/ramen-model.service';
import { ANNOTATION_LABEL_NAME, ENTITY_LABEL_NAME } from '../constants';
import { RelationType } from '../schema/interfaces/relation-type.interface';
import { NodeType } from '../schema/interfaces/node-type.interface';
import { CamiService } from '../cami/cami.service';

@Injectable()
export class GuidelinesService {
  constructor(
    private readonly model: RamenModelService,
    private readonly camiService: CamiService,
  ) {}

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
      camiAvailable: this.camiService.camiAvailable(),
    } satisfies EmConfig;
  }

  getEntityProperties(type: string) {
    const node = this.model.getNodeType(type);
    return node.attributes.filter((attribute) => !attribute.isKey);
  }

  /**
   *  TODO: Aufgrund der funktionsweise von "getRelationTypesOfNode()" bekommt man hier aktuell nur die Relation Types von der obersten Annotation Node. und nicht von allen Subtypes. Das ist aber eigentlich gewünscht.
   *  TASK: add all subannotation types which are connected to any other entity or sub entity type
   */
  private getAnnotationTypes(): string[] {
    const annotationTypes = this.model.getSubtypes(ANNOTATION_LABEL_NAME);
    const entityType = this.model.getNodeType(ENTITY_LABEL_NAME);

    let types: string[] = [];
    annotationTypes.forEach((type) => {
      const newTypes = this.model
        .getRelationTypesOfNode(type)
        .filter((relation) => this.isEntityAnnotationRelation(relation, entityType))
        .map((relation) => this.getAnnotationTypeName(relation, this.model.getNodeType(type)));
      types = types.concat(newTypes);
    });
    return [...new Set(types)];
  }

  private isEntityAnnotationRelation(relation: RelationType, entityType: NodeType): boolean {
    return this.isEntityOrSubtype(relation.from.nodeId, entityType) || this.isEntityOrSubtype(relation.to.nodeId, entityType);
  }

  private isEntityOrSubtype(nodeTypeId: string, entityType: NodeType): boolean {
    const nodeType = this.model.getNodeTypeById(nodeTypeId);

    return nodeType.id === entityType.id || this.model.isSubtypeOf(nodeType.name, entityType.name);
  }

  private getAnnotationTypeName(relation: RelationType, annotationType: NodeType): string {
    const oppositeNodeId = relation.to.nodeId === annotationType.id ? relation.to.nodeId : relation.from.nodeId;

    return this.model.getNodeTypeById(oppositeNodeId).name;
  }
}
