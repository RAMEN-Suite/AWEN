import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { GuidelinesModule } from './guidelines/guidelines.module';
import { EntityModule } from './entity/entity.module';
import { CollectionModule } from './collection/collection.module';
import { Neo4jScheme } from './neo4j/neo4j-config.interface';
import { SchemaModule } from './schema/schema.module';
import { GraphModule } from './graph/graph.module';
import { HealthController } from './health/health.controller';
import { AnnotationModule } from './annotation/annotation.module';
import { CamiModule } from './cami/cami.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    Neo4jModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.getOrThrow<string>('AWEN_DB_HOST'),
        password: config.getOrThrow<string>('AWEN_DB_PASSWORD'),
        port: config.getOrThrow<number>('AWEN_DB_PORT'),
        scheme: config.getOrThrow<Neo4jScheme>('AWEN_DB_SCHEME'),
        username: config.getOrThrow<string>('AWEN_DB_USER'),
        database: config.get<string>('AWEN_DB_NAME'),
      }),
    }),
    GuidelinesModule,
    EntityModule,
    CollectionModule,
    SchemaModule,
    GraphModule,
    AnnotationModule,
    CamiModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
