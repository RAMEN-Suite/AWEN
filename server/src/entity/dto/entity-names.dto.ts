import { PickType } from "@nestjs/mapped-types";
import { EntityDto } from "./entity.dto";

export class EntityNamesDto extends PickType(EntityDto, ['label', 'id'] as const) {}