import { Integer, Node, Relationship } from 'neo4j-driver';
import { EntityNodeDto } from '../entity/dto/entity-node.dto';
import { ANNOTATION_TYPE_NAME, ENTITY_LABEL_NAME, ENTITY_NAME_PROPERTY } from '../constants';
import { EntityNamesDto } from '../entity/dto/entity-names.dto';
import { EntityDto } from '../entity/dto/entity.dto';
import { EntityPropertyDto } from '../entity/dto/entity-property.dto';
import { NodeType } from '../schema/interfaces/node-type.interface';
import { AnnotationDto } from '../annotation/dto/annotation.dto';
import { NodePropertyDto } from '../annotation/dto/node-property.dto';
import { RAMENError } from '../schema/RAMENError';
import { ConnectedNodeDto } from '../annotation/dto/connected-node.dto';
import { AnnotationsOfEntityWithContentDto } from '../annotation/dto/annotations_of_entity_with_content.dto';
import { AnnotationsOfEntityDto } from '../annotation/dto/annotations_of_entity.dto';

export const transformNodeToEntityNodeDTO = (node: Node<Integer, Record<string, unknown>>): EntityNodeDto => {
  const types = node.labels.filter((l) => l !== ENTITY_LABEL_NAME);
  return new EntityNodeDto(node.properties, types);
};

export const transformNodesToEntityNodeDTOs = (nodes: Node<Integer, Record<string, unknown>>[]): EntityNodeDto[] => {
  return nodes.map((node) => {
    return transformNodeToEntityNodeDTO(node);
  });
};

export const transformNodeToNameEntityDTO = (
  node: Node<Integer, Record<string, unknown>>,
  labelKey: string,
  idKey: string,
): EntityNamesDto => {
  return new EntityNamesDto(node.properties[idKey] as string, node.properties[labelKey] as string);
};

export const transformNodesToNameEntityDTOs = (
  nodes: Node<Integer, Record<string, unknown>>[],
  labelKey: string,
  idKey: string,
): EntityNamesDto[] => {
  return nodes.map((node) => transformNodeToNameEntityDTO(node, labelKey, idKey));
};

export const transformNodeToEntityDTO = (node: Node<Integer, Record<string, unknown>>, gNode: NodeType): EntityDto => {
  let label: string | undefined;
  const props: EntityPropertyDto[] = [];

  const types = node.labels.filter((l) => {
    return Array.from(gNode.superTypes.values()).includes(l);
  });
  types.push(gNode.name);

  gNode.attributes.forEach((attribute) => {
    if (attribute.name === ENTITY_NAME_PROPERTY) {
      label = node.properties[ENTITY_NAME_PROPERTY] as string | undefined; // TODO: better type check
    } else if (attribute.name in node.properties) {
      props.push(
        new EntityPropertyDto({
          ...attribute,
          isKey: attribute.isKey ?? false,
          isReadOnly: attribute.isKey ?? false,
          value: node.properties[attribute.name] as string, // TODO: better type check
        }),
      );
    } else {
      props.push(
        new EntityPropertyDto({
          ...attribute,
          isKey: attribute.isKey ?? false,
          isReadOnly: attribute.isKey ?? false,
          value: '',
        }),
      );
    }
  });

  if (!label) {
    // TODO: richtiges error handling
    throw Error();
  }

  return new EntityDto({
    label: label,
    types: types,
    properties: props,
  });
};

export const transformNodesToEntityDTOs = (nodes: Node<Integer, Record<string, unknown>>[], gNode: NodeType): EntityDto[] => {
  return nodes.map((node) => {
    return transformNodeToEntityDTO(node, gNode);
  });
};

export const transformNodeToAnnotationDTO = (node: Node<Integer, Record<string, unknown>>, gNode: NodeType): AnnotationDto => {
  let type: string | undefined;
  const props: NodePropertyDto[] = [];

  const types = node.labels.filter((l) => {
    return Array.from(gNode.superTypes.values()).includes(l);
  });
  types.push(gNode.name);

  gNode.attributes.forEach((attribute) => {
    if (attribute.name === ANNOTATION_TYPE_NAME) {
      type = node.properties[ANNOTATION_TYPE_NAME] as string | undefined; // TODO: better type check
    } else if (attribute.name in node.properties) {
      props.push(
        new NodePropertyDto({
          ...attribute,
          isKey: attribute.isKey ?? false,
          isReadOnly: attribute.isKey ?? false,
          value: node.properties[attribute.name] as string, //TODO
        }),
      );
    } else {
      props.push(
        new NodePropertyDto({
          ...attribute,
          isKey: attribute.isKey ?? false,
          isReadOnly: attribute.isKey ?? false,
          value: '',
        }),
      );
    }
  });

  if (!type) {
    // TODO: richtiges error handling
    throw new RAMENError();
  }

  return new AnnotationDto({
    type: type,
    types: types,
    properties: props,
  });
};

export const transformNodesToAnnotationDTOs = (
  nodes: Node<Integer, Record<string, unknown>>[],
  gNode: NodeType,
): AnnotationDto[] => {
  return nodes.map((node) => {
    return transformNodeToAnnotationDTO(node, gNode);
  });
};

export const transformNodeToAnnotationOfEntityDTO = (
  node: Node<Integer, Record<string, unknown>>,
  direction: string,
  gNode: NodeType,
) => {
  const annotation = transformNodeToAnnotationDTO(node, gNode);
  return new AnnotationsOfEntityDto({
    type: annotation.type,
    types: annotation.types,
    properties: annotation.properties,
    direction: direction,
  });
};

export const transformConnectedNodeToDto = (
  node: Node<Integer, Record<string, unknown>>,
  relationship: Relationship<Integer, Record<string, unknown>>,
  direction: string,
  gNode: NodeType,
): ConnectedNodeDto => {
  const types = node.labels.filter((l) => {
    return Array.from(gNode.superTypes.values()).includes(l);
  });
  types.push(gNode.name);

  const props: NodePropertyDto[] = [];

  gNode.attributes.forEach((attribute) => {
    props.push(
      new NodePropertyDto({
        name: attribute.name,
        value: (node.properties[attribute.name] as string) ?? '', // TODO: better type check
        bounds: attribute.bounds,
        typeId: attribute.typeId,
        isKey: attribute.isKey ?? false,
        isReadOnly: attribute.isKey ?? false,
        constraints: attribute.constraints,
      }),
    );
  });

  return new ConnectedNodeDto({
    types: types,
    properties: props,
    relationshipProperties: relationship.properties,
    direction,
  });
};

export const transformNodeToAnnotationWithContentDTO = (
  node: Node<Integer, Record<string, unknown>>,
  direction: string,
  gNode: NodeType,
  connectedNodes: ConnectedNodeDto[] = [],
): AnnotationsOfEntityWithContentDto => {
  let type: string | undefined;
  const props: NodePropertyDto[] = [];

  const types = node.labels.filter((l) => {
    return Array.from(gNode.superTypes.values()).includes(l);
  });
  types.push(gNode.name);

  gNode.attributes.forEach((attribute) => {
    if (attribute.name === ANNOTATION_TYPE_NAME) {
      type = node.properties[ANNOTATION_TYPE_NAME] as string | undefined; // TODO: better type check
    } else if (attribute.name in node.properties) {
      props.push(
        new NodePropertyDto({
          ...attribute,
          isKey: attribute.isKey ?? false,
          isReadOnly: attribute.isKey ?? false,
          value: node.properties[attribute.name] as string, // TODO: better type check
        }),
      );
    } else {
      props.push(
        new NodePropertyDto({
          ...attribute,
          isKey: attribute.isKey ?? false,
          isReadOnly: attribute.isKey ?? false,
          value: '',
        }),
      );
    }
  });

  if (!type) {
    throw new RAMENError();
  }

  return new AnnotationsOfEntityWithContentDto({
    type: type,
    types: types,
    properties: props,
    direction: direction,
    connectedNodes: connectedNodes,
  });
};
