import { Module } from '@nestjs/common';
import { EntityService } from './entity.service';
import { EntityController } from './entity.controller';
import { CollectionService } from '../collection/collection.service';
import { SchemaModule } from '../schema/schema.module';
import { GraphModule } from '../graph/graph.module';
import { AnnotationModule } from '../annotation/annotation.module';

@Module({
  imports: [SchemaModule, GraphModule, AnnotationModule],
  controllers: [EntityController],
  providers: [EntityService, CollectionService],
})
export class EntityModule {}
