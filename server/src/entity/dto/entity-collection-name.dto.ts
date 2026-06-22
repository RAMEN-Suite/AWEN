import { OldEntityDto } from './old-entity.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CollectionNameTypeDto } from '../../collection/dto/collection.name.type.dto';

export class EntityCollectionNameDto extends OldEntityDto {
  @ApiProperty({
    type: () => [CollectionNameTypeDto],
  })
  collections!: CollectionNameTypeDto[];
}
