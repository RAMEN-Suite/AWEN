import { ApiProperty } from "@nestjs/swagger";
import { CollectionNameDto } from "./collection-name.dto";

export class GetFilterableCollections {
  @ApiProperty()
  collectionFilter: Record<string, CollectionNameDto[]>
}

