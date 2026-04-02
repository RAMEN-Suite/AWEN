import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import { GuidelinesService } from '../guidelines/guidelines.service';
import { CollectionService } from '../collection/collection.service';
import { RamenModelService } from '../schema/ramen-model.service';
import { NodeRepository } from '../graph/node-repository.service';
import {
  ANNOTATION_LABEL_NAME,
  COLLECTION_LABEL_NAME,
  CONTENT_LABEL_NAME,
  ENTITY_LABEL_NAME,
} from '../constants';
import Cypher, { eq, not } from '@neo4j/cypher-builder';
import { Integer, Node, Relationship } from 'neo4j-driver';
import {
  transformConnectedNodeToDto,
  transformNodeToAnnotationDTO,
  transformNodeToAnnotationWithContentDTO,
} from '../utils/node-transformers';
import { ConnectedNodeDto } from './dto/connected-node.dto';

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
      () => {
        this.logger.log('getAnnotationsOfEntity() is working!');
      },
    );
    this.getAnnotationsWithReferencesOfContent(
      'fa3246bc-4ac9-4271-906d-3e4d768ccd5f',
    ).then(() => {
      this.logger.log('getAnnotationsWithReferencesOfContent() is working!');
    });
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

  async getAnnotationsWithReferencesOfContent(entityId: string) {
    const eNode = new Cypher.Node();
    const aNode = new Cypher.Node();
    const conectedEntityNode = new Cypher.Node();
    const conectedContentNode = new Cypher.Node();
    const conectedCollectionNode = new Cypher.Node();

    // Relationship-Variablen für Richtungserkennung
    const relToAnnotation = new Cypher.Relationship();
    const relEntity = new Cypher.Relationship();
    const relContent = new Cypher.Relationship();
    const relCollection = new Cypher.Relationship();

    const searchPattern = new Cypher.Pattern(eNode, {
      labels: ENTITY_LABEL_NAME,
      properties: {
        [this.ENTITY_KEY_PROPERTY]: new Cypher.Param(entityId),
      },
    })
      .related(relToAnnotation, {
        direction: 'undirected',
      })
      .to(aNode, {
        labels: ANNOTATION_LABEL_NAME,
      });

    const optionalEntityPattern = searchPattern
      .related(relEntity, {
        direction: 'undirected',
      })
      .to(conectedEntityNode, {
        labels: ENTITY_LABEL_NAME,
      })
      .where(
        not(
          eq(
            conectedEntityNode.property(this.ENTITY_KEY_PROPERTY),
            new Cypher.Param(entityId),
          ),
        ),
      );

    const optionalContentPattern = searchPattern
      .related(relContent, {
        direction: 'undirected',
      })
      .to(conectedContentNode, {
        labels: CONTENT_LABEL_NAME,
      });

    const optionalCollectionPattern = searchPattern
      .related(relCollection, {
        direction: 'undirected',
      })
      .to(conectedCollectionNode, {
        labels: COLLECTION_LABEL_NAME,
      });

    const clause = new Cypher.Match(searchPattern)
      .optionalMatch(optionalEntityPattern)
      .optionalMatch(optionalContentPattern)
      .optionalMatch(optionalCollectionPattern)
      .return(
        [aNode, 'annotation'],
        [
          Cypher.collect(
            new Cypher.Map({
              node: conectedEntityNode,
              relationship: relEntity,
              direction: new Cypher.Case()
                .when(Cypher.eq(Cypher.startNode(relEntity), aNode))
                .then(new Cypher.Literal('OUTGOING'))
                .else(new Cypher.Literal('INCOMING')),
            }),
          ),
          'connectedEntities',
        ],
        [
          Cypher.collect(
            new Cypher.Map({
              node: conectedContentNode,
              relationship: relContent,
              direction: new Cypher.Case()
                .when(Cypher.eq(Cypher.startNode(relContent), aNode))
                .then(new Cypher.Literal('OUTGOING'))
                .else(new Cypher.Literal('INCOMING')),
            }),
          ),
          'connectedContents',
        ],
        [
          Cypher.collect(
            new Cypher.Map({
              node: conectedCollectionNode,
              relationship: relCollection,
              direction: new Cypher.Case()
                .when(Cypher.eq(Cypher.startNode(relCollection), aNode))
                .then(new Cypher.Literal('OUTGOING'))
                .else(new Cypher.Literal('INCOMING')),
            }),
          ),
          'connectedCollections',
        ],
      );

    const { cypher, params } = clause.build();

    const res = await this.neo4jService.read<{
      annotation: Node<Integer, Record<string, any>>;
      connectedEntities: Array<{
        node: Node;
        relationship: Relationship;
        direction: string;
      }>;
      connectedContents: Array<{
        node: Node;
        relationship: Relationship;
        direction: string;
      }>;
      connectedCollections: Array<{
        node: Node;
        relationship: Relationship;
        direction: string;
      }>;
    }>(cypher, params);

    const annotations = res.records.map((record) => {
      return {
        annotation: record.get('annotation'),
        connectedEntities: record.get('connectedEntities'),
        connectedContents: record.get('connectedContents'),
        connectedCollections: record.get('connectedCollections'),
      };
    });

    return annotations
      .map(
        ({
          annotation,
          connectedEntities,
          connectedContents,
          connectedCollections,
        }) => {
          const gNode = this.model.getMostSpecificType(annotation.labels);
          if (gNode) {
            const connectedNodes: ConnectedNodeDto[] = [
              ...connectedEntities,
              ...connectedContents,
              ...connectedCollections,
            ]
              .filter((c) => !!c.node) // optionalMatch kann null liefern
              .flatMap((c) => {
                const connectedGNode = this.model.getMostSpecificType(
                  c.node.labels,
                ); // ✅ bereits drin
                if (!connectedGNode) return [];
                return [
                  transformConnectedNodeToDto(
                    c.node,
                    c.relationship,
                    c.direction,
                    connectedGNode,
                  ),
                ];
              });

            return transformNodeToAnnotationWithContentDTO(
              annotation,
              gNode,
              connectedNodes,
            );
          }
        },
      )
      .filter((annotation) => !!annotation);
  }
}
