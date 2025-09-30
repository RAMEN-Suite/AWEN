import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLString } from "graphql/type";
import { GraphQLJSONObject } from 'graphql-scalars';


@ObjectType({ description: 'Entity-Node' })
export class EntityModel {

  @Field(type => ID)
  id: string;

  @Field(type => GraphQLString)
  nodeLabel: string;

  @Field(type => [GraphQLString])
  types: string[];

  @Field(type => GraphQLJSONObject)
  properties: Record<string, string>;
}