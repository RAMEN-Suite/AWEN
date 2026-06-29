import { NodePropertyDto } from '../../interfaces';

const castValues = <T extends number | string | boolean>(value: unknown[], dataTypeName: string): T[] => {
  return value.map((v) => castValue(v, dataTypeName));
};
const castValue = <T extends number | string | boolean>(value: unknown, dataTypeName: string): T => {
  switch (dataTypeName.toLowerCase()) {
    case 'integer':
      return parseInt(String(value), 10) as T;
    case 'float':
      return parseFloat(String(value)) as T;
    case 'boolean':
      return Boolean(value) as T;
    case 'string':
      return String(value) as T;
    default:
      return value as T;
  }
};

const visibleProperties = (properties: NodePropertyDto[]): NodePropertyDto[] => {
  return properties.filter((p) => !p.isKey && p.value !== '');
};

const getProperty = (properties: NodePropertyDto[], name: string): NodePropertyDto | undefined => {
  return properties.find((p) => p.name === name);
};

export { castValue, castValues, visibleProperties, getProperty };
