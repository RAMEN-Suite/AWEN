import { Module } from '@nestjs/common';
import { SchemaLoaderService } from './schema-loader.service';
import { RamenModelService } from './ramen-model.service';
import { ConfigService } from '@nestjs/config';

const schemaLoaderProvider = {
  provide: SchemaLoaderService,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const loader = new SchemaLoaderService(configService);
    await loader.loadSchemas();
    return loader;
  },
};

@Module({
  providers: [schemaLoaderProvider, RamenModelService],
  exports: [SchemaLoaderService, RamenModelService],
})
export class SchemaModule {}
