import { PartialType, PickType } from '@nestjs/swagger';
import { EntitySearchDto } from './entity-search.dto';

export class EntityAutocompleteQueryDto extends PartialType(PickType(EntitySearchDto, ['collectionFilter', 'types'] as const)) {}
