import { IsOptional } from "class-validator";
import { Transform } from 'class-transformer';
import { ApiProperty, PickType } from "@nestjs/swagger";
import { EntityDto } from "./entity.dto";

export class EntitySearchDto extends PickType(EntityDto, ['label', "types"] as const) {

  @ApiProperty({
    description: 'An object containing the names of existing collection types as keys and the UUIDs of the collections being searched for as values in an array.',
    example: {
      'Department': ['efc22c81-fb22-4f90-81d0-d3790b41b908'],
      'Volume': ['6daa7b3d-0cf1-4b76-8138-d8fadca514f9', '7061836f-592f-461e-bc04-081faf4d9f01']
    },
  })
  @IsOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'object') return value;
    try {
      const dec = decodeURIComponent(value);
      const json = JSON.parse(dec);
      return json
    } catch { return undefined; }
  }, { toClassOnly: true })
  collectionFilter?: Record<string, string[]>;


}