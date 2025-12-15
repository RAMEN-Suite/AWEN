import { PickType } from "@nestjs/swagger";
import { CollectionDto } from "./collection.dto";

export class CollectionNameTypeDto extends PickType(CollectionDto, [
  "id",
  "label",
  "types"
] as const) {}