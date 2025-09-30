import { Integer, Node } from 'neo4j-driver';


export type EntityDB = Node<Integer, { [key: string]: any }, string>;