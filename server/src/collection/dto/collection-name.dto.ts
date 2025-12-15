import { PickType } from "@nestjs/swagger";
import { CollectionDto } from "./collection.dto";

export class CollectionNameDto extends PickType(CollectionDto, ['id', 'label'] as const) {}