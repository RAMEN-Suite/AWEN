import { Integer, Node } from 'neo4j-driver';
import { EntityDto } from '../entity/dto/entity.dto';

export const transformNodeToEntityDTO = (
  node: Node<Integer, Record<string, any>>,
): EntityDto => {
  return {
    type: 'Entity',
    properties: node.properties,
  };
};
