import { Injectable } from '@nestjs/common';
import { SchemaLoaderService } from './schema-loader.service';

@Injectable()
export class RamenModelService {
  constructor(private schema: SchemaLoaderService) {}

  getNodeType(name: string) {
    return this.schema.getRegistry().getNodeType(name);
  }

  getSuperNodes(name: string) {
    return this.schema.getRegistry().getSuperNodes(name);
  }

  hasNodeType(name: string): boolean {
    return this.schema.getRegistry().hasNodeType(name);
  }

  getMostSpecificType(names: string[]) {
    return this.schema.getRegistry().getMostSpecificType(names);
  }

  getAttribute(nodeName: string, paramName: string) {
    const node = this.getNodeType(nodeName);
    return node?.attributes.find((attribute) => attribute.name === paramName);
  }

  getNodeKeyField(name: string) {
    return this.schema.getRegistry().getNodeKeyField(name);
  }

  getCollectionChains() {
    return this.schema.getRegistry().collectionChains;
  }

  getSubtypes(name: string) {
    return this.schema.getRegistry().getTypes(name);
  }
}
