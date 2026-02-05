import { Injectable } from '@nestjs/common';
import { SchemaLoaderService } from './schema-loader.service';

@Injectable()
export class RamenModelService {
  constructor(private schema: SchemaLoaderService) {}

  getNodeType(name: string) {
    return this.schema.getRegistry().getNodeType(name);
  }

  isEntityType(type: string): boolean {
    const node = this.getNodeType(type);
    return !!node;
  }

  getNodeKeyField(name: string) {
    return this.schema.getRegistry().getNodeKeyField(name);
  }
}
