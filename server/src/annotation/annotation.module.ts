import { Module } from '@nestjs/common';
import { AnnotationService } from './annotation.service';
import { SchemaModule } from '../schema/schema.module';
import { GraphModule } from '../graph/graph.module';
import { CollectionService } from '../collection/collection.service';
import { AnnotationController } from './annotation.controller';
import { EntityService } from '../entity/entity.service';

@Module({
  imports: [SchemaModule, GraphModule],
  providers: [AnnotationService, CollectionService, EntityService],
  exports: [AnnotationService],
  controllers: [AnnotationController],
})
export class AnnotationModule {}
