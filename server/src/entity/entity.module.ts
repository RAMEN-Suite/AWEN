import { Module } from '@nestjs/common';
import { EntityService } from './entity.service';
import { EntityController } from './entity.controller';
import { CollectionService } from '../collection/collection.service';

@Module({
  controllers: [EntityController],
  providers: [EntityService, CollectionService],
})
export class EntityModule {}
