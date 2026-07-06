import { NodePropertyDto } from '../../interfaces';
import { ENTITY_NAME_PROPERTY } from '../../constants';

const getKeyProperty = (
  properties: NodePropertyDto[],
): NodePropertyDto | undefined => {
  return properties.find((p) => p.isKey);
};

const getLabelProperty = (
  properties: NodePropertyDto[],
): NodePropertyDto | undefined => {
  return properties.find((p) => p.name === ENTITY_NAME_PROPERTY);
};

export { getKeyProperty, getLabelProperty };
