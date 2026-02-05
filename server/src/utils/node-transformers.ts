import { Integer, Node } from 'neo4j-driver';
import { EntityDto } from '../entity/dto/entity.dto';
import { ENTITY_LABEL_NAME } from '../constants';

export const transformNodeToEntityDTO = (
  node: Node<Integer, Record<string, any>>,
): EntityDto => {
  const types = node.labels.filter((l) => l !== ENTITY_LABEL_NAME);
  return new EntityDto(node.properties, types);
};
