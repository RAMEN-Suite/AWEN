import { Module } from '@nestjs/common';
import { SchemaLoaderService } from './schema-loader.service';
import { RamenModelService } from './ramen-model.service';

@Module({
  providers: [SchemaLoaderService, RamenModelService],
  exports: [SchemaLoaderService, RamenModelService],
})
export class SchemaModule {}
