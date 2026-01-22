import { DynamicModule, Global, Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { createDriver } from './neo4j.utils';
import { Neo4jConfig } from './neo4j-config.interface';
import { Neo4jModuleOptions } from './neo4j-module-options.interface';

const NEO4J_OPTIONS = 'NEO4J_OPTIONS';
const NEO4J_DRIVER = 'NEO4J_DRIVER';

@Global()
@Module({
  providers: [Neo4jService],
  controllers: [],
})
export class Neo4jModule {
  static forRoot(config: Neo4jConfig): DynamicModule {
    return {
      module: Neo4jModule,
      providers: [
        {
          provide: NEO4J_OPTIONS,
          useValue: config,
        },
        {
          provide: NEO4J_DRIVER,
          inject: [NEO4J_OPTIONS],
          useFactory: async (config: Neo4jConfig) => createDriver(config),
        },
        Neo4jService,
      ],
      exports: [Neo4jService, NEO4J_OPTIONS, NEO4J_DRIVER],
    };
  }

  static forRootAsync(config: Neo4jModuleOptions): DynamicModule {
    return {
      module: Neo4jModule,
      providers: [
        {
          provide: NEO4J_OPTIONS,
          inject: config.inject,
          useFactory: config.useFactory,
        },
        {
          provide: NEO4J_DRIVER,
          inject: [NEO4J_OPTIONS],
          useFactory: async (config: Neo4jConfig) => createDriver(config),
        },
        Neo4jService,
      ],
      exports: [Neo4jService, NEO4J_OPTIONS, NEO4J_DRIVER],
    };
  }
}
