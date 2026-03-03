import { Integer, Node } from 'neo4j-driver';
import { EntityNodeDto } from '../entity/dto/entity-node.dto';
import { ENTITY_LABEL_NAME } from '../constants';
import { EntityNamesDto } from '../entity/dto/entity-names.dto';
import { EntityDto } from '../entity/dto/entity.dto';
import { EntityPropertyDto } from '../entity/dto/entity-property.dto';
import { NodeType } from '../schema/interfaces/node-type.interface';

export const transformNodeToEntityNodeDTO = (
  node: Node<Integer, Record<string, any>>,
): EntityNodeDto => {
  const types = node.labels.filter((l) => l !== ENTITY_LABEL_NAME);
  return new EntityNodeDto(node.properties, types);
};

export const transformNodesToEntityNodeDTOs = (
  nodes: Node<Integer, Record<string, any>>[],
): EntityNodeDto[] => {
  return nodes.map((node) => {
    return transformNodeToEntityNodeDTO(node);
  });
};

export const transformNodeToNameEntityDTO = (
  node: Node<Integer, Record<string, any>>,
  labelKey: string,
  idKey: string,
): EntityNamesDto => {
  return new EntityNamesDto(
    node.properties[idKey] as string,
    node.properties[labelKey] as string,
  );
};

export const transformNodesToNameEntityDTOs = (
  nodes: Node<Integer, Record<string, any>>[],
  labelKey: string,
  idKey: string,
): EntityNamesDto[] => {
  return nodes.map((node) =>
    transformNodeToNameEntityDTO(node, labelKey, idKey),
  );
};

export const transformNodeToEntityDTO = (
  node: Node<Integer, Record<string, any>>,
  gNode: NodeType,
): EntityDto => {
  let label: string | undefined;
  const props: EntityPropertyDto[] = [];

  const types = node.labels.filter((l) => {
    return Array.from(gNode.superTypes.values()).includes(l);
  });
  types.push(gNode.name);

  gNode.attributes.forEach((attribute) => {
    if (attribute.name === 'label') {
      label = node.properties['label'] as string | undefined;
    } else if (attribute.name in node.properties) {
      props.push(
        new EntityPropertyDto({
          ...attribute,
          isKey: attribute.isKey ?? false,
          isReadOnly: attribute.isKey ?? false,
          value: node.properties[attribute.name],
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

export const transformNodesToEntityDTOs = (
  nodes: Node<Integer, Record<string, any>>[],
  gNode: NodeType,
): EntityDto[] => {
  return nodes.map((node) => {
    return transformNodeToEntityDTO(node, gNode);
  });
};
