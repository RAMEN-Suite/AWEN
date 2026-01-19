import { PickType } from '@nestjs/swagger';
import { EntityDto } from './entity.dto';

export class EntityNamesDto extends PickType(EntityDto, [
  'label',
  'id',
] as const) {}
