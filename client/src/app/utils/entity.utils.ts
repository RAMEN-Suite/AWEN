import { NodePropertyDto } from '../../interfaces';

const getKeyProperty = (properties: NodePropertyDto[]): NodePropertyDto | undefined => {
  return properties.find((p) => p.isKey);
};

export { getKeyProperty };
