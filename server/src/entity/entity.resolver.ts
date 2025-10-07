import { Args, ID, Resolver, Query } from "@nestjs/graphql";
import { EntityModel } from "./models/entity.model";
import { EntityService } from "./entity.service";
import { parseStringToSearchArray } from "../utils/utils";
import { EntitiesByNameArgs } from "./dto/entities-by-name.args";
import { EntityNameModel } from "./models/entity-name.model";

@Resolver(() => EntityModel)
export class EntityResolver {
  constructor(
    private entityService: EntityService,
  ) {}

  @Query(() => EntityModel)
  async entityById(@Args('id', { type: () => ID }) id: string) {
    return await this.entityService.findOneById(id);
  }

  @Query(() => [EntityModel])
  async entitiesByName(@Args() args: EntitiesByNameArgs) {
    const parsedName = parseStringToSearchArray(args.name).join('* AND ') + '*';
    return await this.entityService.findByName(parsedName);
  }

  @Query(() => [EntityNameModel])
  async entityNamesByName(@Args() args: EntitiesByNameArgs) {
    const parsedName = parseStringToSearchArray(args.name).join('* AND ') + '*';
    return await this.entityService.findNamesByName(parsedName);
  }

}
