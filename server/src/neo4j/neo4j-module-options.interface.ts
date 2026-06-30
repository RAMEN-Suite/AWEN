import { Neo4jConfig } from './neo4j-config.interface';
import { InjectionToken, OptionalFactoryDependency } from '@nestjs/common';

export interface Neo4jModuleOptions {
  useFactory: (...args: never[]) => Neo4jConfig;
  inject?: (InjectionToken | OptionalFactoryDependency)[] | undefined;
}
