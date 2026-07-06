import { NodePropertyDto } from '../../interfaces';

const castValues = <T extends number | string | boolean>(
  value: unknown[],
  dataTypeName: string,
): T[] => {
  return value.map((v) => castValue(v, dataTypeName));
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const castValue = <T extends number | string | boolean>(
  value: unknown,
  dataTypeName: string,
): T => {
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

const visibleProperties = (
  properties: NodePropertyDto[],
): NodePropertyDto[] => {
  return properties.filter((p) => !p.isKey && p.value !== '');
};

const getProperty = (
  properties: NodePropertyDto[],
  name: string,
): NodePropertyDto | undefined => {
  return properties.find((p) => p.name === name);
};

const castUnknownToString = (value: unknown): string => {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
};

export {
  castValue,
  castValues,
  visibleProperties,
  getProperty,
  castUnknownToString,
};
