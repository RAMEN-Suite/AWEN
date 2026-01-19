import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { GuidelinesModule } from './guidelines/guidelines.module';
import { EntityModule } from './entity/entity.module';
import { CollectionModule } from './collection/collection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    Neo4jModule.forRoot({
      host: process.env.DB_HOST ?? '',
      password: process.env.DB_PASSWORD ?? '',
      port: process.env.DB_PORT ?? '',
      scheme: process.env.DB_SCHEME ?? '',
      username: process.env.DB_USER ?? '',
      database: process.env.DB_NAME ?? undefined,
    }),
    GuidelinesModule,
    EntityModule,
    CollectionModule,
  ],
})
export class AppModule {}
