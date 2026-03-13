import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import { GuidelinesService } from '../guidelines/guidelines.service';
import { CollectionService } from '../collection/collection.service';
import { RamenModelService } from '../schema/ramen-model.service';
import { NodeRepository } from '../graph/node-repository.service';
import { ANNOTATION_LABEL_NAME, ENTITY_LABEL_NAME } from '../constants';
import Cypher from '@neo4j/cypher-builder';
import { Integer, Node } from 'neo4j-driver';
import { transformNodeToAnnotationDTO } from '../utils/node-transformers';

@Injectable()
export class AnnotationService {
  logger = new Logger(AnnotationService.name);

  ANNOTATION_KEY_PROPERTY!: string;
  ENTITY_KEY_PROPERTY!: string;

  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly guidelinesService: GuidelinesService,
    private readonly collectionService: CollectionService,
    private readonly model: RamenModelService,
    private readonly nodes: NodeRepository,
  ) {
    this.ANNOTATION_KEY_PROPERTY = this.model.getNodeKeyField(
      ANNOTATION_LABEL_NAME,
    );
    this.ENTITY_KEY_PROPERTY = this.model.getNodeKeyField(ENTITY_LABEL_NAME);
    this.getAnnotationsOfEntity('fa3246bc-4ac9-4271-906d-3e4d768ccd5f').then(
      (result) => {
        this.logger.log(result);
      },
    );
  }

  async getAnnotationsOfEntity(entityId: string) {
    const eNode = new Cypher.Node();
    const aNode = new Cypher.Node();

    const searchPattern = new Cypher.Pattern(eNode, {
      labels: ENTITY_LABEL_NAME,
      properties: {
        [this.ENTITY_KEY_PROPERTY]: new Cypher.Param(entityId),
      },
    })
      .related({
        direction: 'undirected',
      })
      .to(aNode, {
        labels: ANNOTATION_LABEL_NAME,
      });

    const clause = new Cypher.Match(searchPattern).return([
      aNode,
      'annotation',
    ]);
    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{
      annotation: Node<Integer, Record<string, any>>;
    }>(cypher, params);
    const annotations = res.records.map((record) => {
      return record.get('annotation');
    });

    return annotations
      .map((annotation) => {
        const gNode = this.model.getMostSpecificType(annotation.labels);
        if (gNode) {
          return transformNodeToAnnotationDTO(annotation, gNode);
        }
      })
      .filter((annotation) => !!annotation);
  }

  async getAnnotationsWithReferencesOfEntity(entityId: string) {
    const eNode = new Cypher.Node();
    const aNode = new Cypher.Node();
    const conectedEntityNode = new Cypher.Node();
    const conectedContentNode = new Cypher.Node();
    const conectedCollectionNode = new Cypher.Node();

    const searchPattern = new Cypher.Pattern(eNode, {
      labels: ENTITY_LABEL_NAME,
      properties: {
        [this.ENTITY_KEY_PROPERTY]: new Cypher.Param(entityId),
      },
    })
      .related({
        direction: 'undirected',
      })
      .to(aNode, {
        labels: ANNOTATION_LABEL_NAME,
      });

    // TODO: Optional patterns
    const optionalEntityPattern = new Cypher.Pattern();
    const optionalContentPattern = new Cypher.Pattern();
    const optionalCollectionPattern = new Cypher.Pattern();

    const clause = new Cypher.Match(searchPattern)
      .optionalMatch(optionalEntityPattern)
      .optionalMatch(optionalContentPattern)
      .optionalMatch(optionalCollectionPattern)
      .return(
        [aNode, 'annotation'],
        [conectedEntityNode, 'x'], // TODO: ordentliche return map für das ganze
        [conectedContentNode, 'y'],
        [conectedCollectionNode, 'z'],
      );

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{
      annotation: Node<Integer, Record<string, any>>;
    }>(cypher, params);
    const annotations = res.records.map((record) => {
      return record.get('annotation');
    });

    return annotations
      .map((annotation) => {
        const gNode = this.model.getMostSpecificType(annotation.labels);
        if (gNode) {
          return transformNodeToAnnotationDTO(annotation, gNode);
        }
      })
      .filter((annotation) => !!annotation);
  }
}
