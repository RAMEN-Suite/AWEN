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

export { castValue, castValues };
