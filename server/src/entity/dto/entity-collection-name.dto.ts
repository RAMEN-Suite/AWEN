import { EntityDto } from './entity.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CollectionNameTypeDto } from '../../collection/dto/collection.name.type.dto';

export class EntityCollectionNameDto extends EntityDto {
  @ApiProperty({
    type: () => [CollectionNameTypeDto],
  })
  collections: CollectionNameTypeDto[];
}
