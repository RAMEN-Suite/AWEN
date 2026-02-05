import { PickType } from '@nestjs/swagger';
import { OldEntityDto } from './old-entity.dto';

export class EntityNamesDto extends PickType(OldEntityDto, [
  'label',
  'id',
] as const) {}
