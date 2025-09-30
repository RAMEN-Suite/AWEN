import { Args, ID, Resolver, Query } from "@nestjs/graphql";
import { EntityModel } from "./models/entity.model";
import { EntityService } from "./entity.service";

@Resolver(() => EntityModel)
export class EntityResolver {
  constructor(
    private entityService: EntityService,
  ) {}

  @Query(() => EntityModel)
  async entity(@Args('id', { type: () => ID }) id: string) {
    return await this.entityService.findOneById(id);
  }
}
