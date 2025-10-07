import { ArgsType, Field } from "@nestjs/graphql";
import { GraphQLString } from "graphql/type";

@ArgsType()
export class EntitiesByNameArgs {

  @Field(() => GraphQLString)
  name: string;
}
