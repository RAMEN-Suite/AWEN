import { CreateEntityDto } from './create-entity.dto';
import { PickType } from '@nestjs/swagger';

export class UpdateEntityDto extends PickType(CreateEntityDto, ['properties'] as const) {}
