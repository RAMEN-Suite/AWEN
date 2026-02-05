import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { GuidelinesModule } from './guidelines/guidelines.module';
import { EntityModule } from './entity/entity.module';
import { CollectionModule } from './collection/collection.module';
import { Neo4jScheme } from './neo4j/neo4j-config.interface';
import { SchemaModule } from './schema/schema.module';
import { GraphModule } from './graph/graph.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    Neo4jModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.getOrThrow<string>('DB_HOST'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        port: config.getOrThrow<number>('DB_PORT'),
        scheme: config.getOrThrow<Neo4jScheme>('DB_SCHEME'),
        username: config.getOrThrow<string>('DB_USER'),
        database: config.get<string>('DB_NAME'),
      }),
    }),
    GuidelinesModule,
    EntityModule,
    CollectionModule,
    SchemaModule,
    GraphModule,
  ],
})
export class AppModule {}
