import Cypher from '@neo4j/cypher-builder';
import type { SetParam } from '@neo4j/cypher-builder';

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

const metadataForNewNode = (node: Cypher.Node): SetParam[] => {
  return [
    [node.property('_created_at'), Cypher.localdatetime()],
    [node.property('_updated_at'), Cypher.localdatetime()],

    [node.property('_version'), new Cypher.Literal(1)],
  ];
};

const metadataForUpdateNode = (node: Cypher.Node): SetParam[] => {
  return [
    [node.property('_updated_at'), Cypher.localdatetime()],
    [
      node.property('_version'),
      Cypher.plus(node.property('_version'), new Cypher.Literal(1)),
    ],
  ];
};

export {
  parseStringToSearchArray,
  parseStringToSearchQueryString,
  metadataForNewNode,
  metadataForUpdateNode,
};
