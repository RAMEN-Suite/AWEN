import { Module } from '@nestjs/common';
import { AnnotationService } from './annotation.service';
import { SchemaModule } from '../schema/schema.module';
import { GraphModule } from '../graph/graph.module';
import { CollectionService } from '../collection/collection.service';

@Module({
  imports: [SchemaModule, GraphModule],
  providers: [AnnotationService, CollectionService],
  exports: [AnnotationService],
})
export class AnnotationModule {}
