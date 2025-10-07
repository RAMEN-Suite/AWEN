import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLString } from "graphql/type";
import { GraphQLJSONObject } from 'graphql-scalars';


@ObjectType({ description: 'Entity name and id' })
export class EntityNameModel {

  @Field(type => ID)
  id: string;

  @Field(type => GraphQLString)
  name: string;
}