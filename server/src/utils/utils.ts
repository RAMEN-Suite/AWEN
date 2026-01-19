const parseStringToSearchArray = (string: string): string[] => {
  const toBeRemoved = [',', '(', ')', '>', '<', '.', '*', ';', '/', '-'];

  return toBeRemoved
    .reduce((acc, char) => acc.split(char).join(' '), string)
    .split(' ')
    .filter((f) => f.length > 1);
};

const parseStringToSearchQueryString = (string: string): string => {
  return parseStringToSearchArray(string).join('* AND ') + '*';
};

export { parseStringToSearchArray, parseStringToSearchQueryString };
