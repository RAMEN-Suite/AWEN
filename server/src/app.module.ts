import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { GuidelinesModule } from './guidelines/guidelines.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from "path";
import { GraphQLDirective } from "graphql/type";
import { DirectiveLocation } from "graphql/language";
import { EntityModule } from './entity/entity.module';


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            name: 'upper',
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
        ],
      },
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
