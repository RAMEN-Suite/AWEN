import { ApiProperty } from '@nestjs/swagger';

export class EntityDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  properties: Record<string, any>;
}
