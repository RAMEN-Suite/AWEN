import { Integer, Node } from 'neo4j-driver';
import { EntityDto } from '../entity/dto/entity.dto';
import { ENTITY_LABEL_NAME } from '../constants';
import { EntityNamesDto } from '../entity/dto/entity-names.dto';

export const transformNodeToEntityDTO = (
  node: Node<Integer, Record<string, any>>,
): EntityDto => {
  const types = node.labels.filter((l) => l !== ENTITY_LABEL_NAME);
  return new EntityDto(node.properties, types);
};

export const transformNodesToEntityDTOs = (
  nodes: Node<Integer, Record<string, any>>[],
): EntityDto[] => {
  return nodes.map((node) => {
    return transformNodeToEntityDTO(node);
  });
};

export const transformNodeToNameEntityDTO = (
  node: Node<Integer, Record<string, any>>,
  labelKey: string,
  idKey: string,
): EntityNamesDto => {
  return new EntityNamesDto(
    node.properties[labelKey] as string,
    node.properties[idKey] as string,
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
