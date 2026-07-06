import { PickType } from '@nestjs/swagger';
import { CreateAnnotationDto } from './create-annotation.dto';

export class UpdateAnnotationDto extends PickType(CreateAnnotationDto, ['properties'] as const) {}
