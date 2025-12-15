import { EntityDto } from "./entity.dto";
import { ApiProperty } from "@nestjs/swagger";
import { CollectionNameDto } from "../../collection/dto/collection-name.dto";

export class EntityCollectionNameDto extends EntityDto {

  @ApiProperty()
  collections: CollectionNameDto[];

}