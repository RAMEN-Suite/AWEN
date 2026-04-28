import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsUUID } from 'class-validator';

export class CreateAnnotationDto {
  @ApiProperty()
  @IsUUID()
  entityId: string;

  @ApiProperty()
  @IsObject()
  properties: Record<string, unknown>;
}
