import { ApiProperty } from "@nestjs/swagger";
import { CollectionName } from "./collection-name.dto";

export class GetFilterableCollections {
  @ApiProperty()
  collectionFilter: Record<string, CollectionName[]>
}

