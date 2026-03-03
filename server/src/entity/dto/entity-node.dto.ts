import { ApiProperty } from '@nestjs/swagger';
import { NodeDto } from '../../dto/node.dto';
import { IsString } from 'class-validator';

export class EntityNodeDto extends NodeDto {
  @ApiProperty({
    description: 'The RAMEN type of the Node.',
    example: 'Entity',
    type: 'string',
  })
  @IsString()
  ramenType: string = 'Entity';

  constructor(properties: Record<string, any>, types?: string[]) {
    super(properties, types);
  }
}
