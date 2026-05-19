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
  FROM_ANNOTATION_REL_TYPE,
  TO_ANNOTATION_REL_TYPE,
} from '../constants';
import Cypher, { and, eq, not, or, type SetParam } from '@neo4j/cypher-builder';
import { Integer, Node, Relationship } from 'neo4j-driver';
import {
  transformConnectedNodeToDto,
  transformNodeToAnnotationDTO,
  transformNodeToAnnotationWithContentDTO,
} from '../utils/node-transformers';
import { ConnectedNodeDto } from './dto/connected-node.dto';
import { metadataForNewNode, metadataForUpdateNode } from '../utils/utils';
import { AnnotationDto } from './dto/annotation.dto';

@Injectable()
export class AnnotationService {
  logger = new Logger(AnnotationService.name);

  ANNOTATION_KEY_PROPERTY!: string;
  ENTITY_KEY_PROPERTY!: string;
  CONTENT_KEY_PROPERTY!: string;

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
    this.CONTENT_KEY_PROPERTY = this.model.getNodeKeyField(CONTENT_LABEL_NAME);
  }

  async get(id: string): Promise<AnnotationDto> {
    const annotationNode = await this.getNode(id);
    const gNode = this.model.getMostSpecificType(annotationNode.labels);
    return transformNodeToAnnotationDTO(annotationNode, gNode);
  }

  async createForEntity(
    entityId: string,
    type: string,
    properties: Record<string, unknown>,
  ) {
    const nodeType = this.model.getNodeType(type);

    const [valid, message]: [valid: boolean, message: string[]] =
      this.model.validateAttributes(nodeType, properties);

    if (!valid) {
      throw new Error('Invalid Attributes', { cause: message });
    }

    const key = this.model.getNodeKeyField(type);

    const nodeLabels = Array.from(nodeType.superTypes.values());
    nodeLabels.push(type);

    const nodeProperties: Record<string, Cypher.Expr> = {};
    Object.entries(properties).forEach(([key, value]) => {
      nodeProperties[key] = new Cypher.Param(value);
    });
    nodeProperties[key] = Cypher.randomUUID();

    const entityNode = new Cypher.Node();
    const annotationNode = new Cypher.Node();

    const matchEntity = new Cypher.Match(
      new Cypher.Pattern(entityNode, {
        labels: ENTITY_LABEL_NAME,
        properties: {
          [this.ENTITY_KEY_PROPERTY]: new Cypher.Param(entityId),
        },
      }),
    );

    const createAnnotation = new Cypher.Create(
      new Cypher.Pattern(annotationNode, {
        labels: ANNOTATION_LABEL_NAME,
        properties: nodeProperties,
      })
        .related(new Cypher.Relationship(), {
          type: TO_ANNOTATION_REL_TYPE,
          direction: 'left',
        })
        .to(entityNode),
    );

    const clause = matchEntity
      .create(createAnnotation)
      .set(...metadataForNewNode(annotationNode))
      .return([annotationNode.property(key), 'id']);

    const { cypher, params } = clause.build();
    const res = await this.neo4jService.write<{ id: string }>(cypher, params);
    return res.records[0].get('id');
  }

  async update(id: string, properties: Record<string, unknown>) {
    const annotation = await this.getNode(id);

    const nodeType = this.model.getMostSpecificType(annotation.labels);

    const [valid, message]: [valid: boolean, message: string[]] =
      this.model.validateAttributes(nodeType, properties);

    if (!valid) {
      throw new Error('Invalid Attributes', { cause: message });
    }

    const key = this.model.getNodeKeyField(nodeType.name);

    const aNode = new Cypher.Node();

    const nodeProperties: SetParam[] = [];
    Object.entries(properties).forEach(([key, value]) => {
      nodeProperties.push([aNode.property(key), new Cypher.Param(value)]);
    });

    const pattern = new Cypher.Pattern(aNode, {
      properties: {
        [key]: new Cypher.Param(id),
      },
    });
    const { cypher, params } = new Cypher.Match(pattern)
      .set(...nodeProperties)
      .set(...metadataForUpdateNode(aNode))
      .return([aNode.property(key), 'id'])
      .build();
    const res = await this.neo4jService.write<{ id: string }>(cypher, params);
    return res.records[0].get('id');
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
                );
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

  async delete(id: string) {
    const aNode = new Cypher.Node();
    const pattern = new Cypher.Pattern(aNode, {
      labels: ANNOTATION_LABEL_NAME,
      properties: {
        [this.ANNOTATION_KEY_PROPERTY]: new Cypher.Param(id),
      },
    });
    const { cypher, params } = new Cypher.Match(pattern)
      .detachDelete(aNode)
      .build();
    await this.neo4jService.write(cypher, params);
  }

  async deleteConnection(id: string, connectedNodeId: string) {
    const aNode = new Cypher.Node();
    const connectedNode = new Cypher.Node();
    const relation = new Cypher.Relationship();
    const pattern = new Cypher.Pattern(aNode, {
      labels: ANNOTATION_LABEL_NAME,
      properties: {
        [this.ANNOTATION_KEY_PROPERTY]: new Cypher.Param(id),
      },
    })
      .related(relation, {
        direction: 'right',
        type: FROM_ANNOTATION_REL_TYPE,
      })
      .to(connectedNode)
      .where(
        and(
          or(
            connectedNode.hasLabels(ANNOTATION_LABEL_NAME),
            connectedNode.hasLabels(CONTENT_LABEL_NAME),
            connectedNode.hasLabels(ENTITY_LABEL_NAME),
            connectedNode.hasLabels(COLLECTION_LABEL_NAME),
          ),
          or(
            eq(
              connectedNode.property(this.ANNOTATION_KEY_PROPERTY),
              new Cypher.Param(connectedNodeId),
            ),
            eq(
              connectedNode.property(this.ENTITY_KEY_PROPERTY),
              new Cypher.Param(connectedNodeId),
            ),
            eq(
              connectedNode.property(this.CONTENT_KEY_PROPERTY),
              new Cypher.Param(connectedNodeId),
            ),
          ),
        ),
      );
    const { cypher, params } = new Cypher.Match(pattern)
      .delete(relation)
      .build();
    await this.neo4jService.write(cypher, params);
  }

  async createConnection(id: string, connectedNodeId: string) {
    // Throws exception if Annotation does not exist
    await this.getNode(id);

    const aNode = new Cypher.Node();
    const connectedNode = new Cypher.Node();
    const relation = new Cypher.Relationship();
    const matchAnnotation = new Cypher.Pattern(aNode, {
      labels: ANNOTATION_LABEL_NAME,
      properties: {
        [this.ANNOTATION_KEY_PROPERTY]: new Cypher.Param(id),
      },
    });
    const matchConnectedNode = new Cypher.Pattern(connectedNode).where(
      and(
        or(
          connectedNode.hasLabels(ANNOTATION_LABEL_NAME),
          connectedNode.hasLabels(CONTENT_LABEL_NAME),
          connectedNode.hasLabels(ENTITY_LABEL_NAME),
          connectedNode.hasLabels(COLLECTION_LABEL_NAME),
        ),
        or(
          eq(
            connectedNode.property(this.ANNOTATION_KEY_PROPERTY),
            new Cypher.Param(connectedNodeId),
          ),
          eq(
            connectedNode.property(this.ENTITY_KEY_PROPERTY),
            new Cypher.Param(connectedNodeId),
          ),
          eq(
            connectedNode.property(this.CONTENT_KEY_PROPERTY),
            new Cypher.Param(connectedNodeId),
          ),
        ),
      ),
    );

    const mergePattern = new Cypher.Pattern(aNode)
      .related(relation, {
        direction: 'right',
        type: FROM_ANNOTATION_REL_TYPE,
      })
      .to(connectedNode);

    const { cypher, params } = new Cypher.Match(matchAnnotation)
      .match(matchConnectedNode)
      .merge(mergePattern)
      .build();
    this.logger.log(cypher);
    await this.neo4jService.write(cypher, params);
  }

  /**
   * Returns an Annotation Node with the given id
   * @param id The annotations key
   * @throws Error If there is no annotation with the given id
   */
  async getNode(id: string) {
    const annotation = await this.nodes.getById(id, {
      labels: ANNOTATION_LABEL_NAME,
    });

    if (!annotation) {
      throw new Error('There is no annotation with the given id.');
    }
    return annotation;
  }
}
