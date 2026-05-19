import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator';

export class CreateAnnotationDto {
  @ApiProperty()
  @IsUUID()
  entityId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsObject()
  properties: Record<string, unknown>;
}
