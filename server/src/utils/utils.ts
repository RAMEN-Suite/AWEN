
const parseStringToSearchArray = (string: string): string[] => {
  const toBeRemoved = [',', '(', ')', '>', '<', '.', '*', ';', '/', '-'];

  return toBeRemoved
    .reduce((acc, char) => acc.split(char).join(' '), string)
    .split(' ')
    .filter((f) => f.length > 1);
}



export {
  parseStringToSearchArray
}