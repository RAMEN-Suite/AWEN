import { Neo4jConfig } from './neo4j-config.interface';

export interface Neo4jModuleOptions {
  useFactory: (...args: any[]) => Neo4jConfig;
  inject?: any[];
}
