import { PickType } from "@nestjs/swagger";
import { CollectionDto } from "./collection.dto";

export class CollectionName extends PickType(CollectionDto, ['id', 'label'] as const) {}