import { Injectable, Logger } from '@nestjs/common';
import { SchemaLoaderService } from './schema-loader.service';
import { RAMENError } from './RAMENError';

@Injectable()
export class RamenModelService {
  logger = new Logger(RamenModelService.name);
  constructor(private schema: SchemaLoaderService) {}

  getNodeType(name: string) {
    const type = this.schema.getRegistry().getNodeType(name);
    if (!type) {
      this.logger.error(`There is no node of the type "${name}".`);
      throw new RAMENError(`There is no node of the type "${name}".`);
    }
    return type;
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
    const key = this.schema.getRegistry().getNodeKeyField(name);
    if (!key) {
      this.logger.error(`There is no id field for ${name} nodes.`);
      throw new RAMENError(`There is no id field for ${name} nodes.`);
    }
    return key;
  }

  getCollectionChains() {
    return this.schema.getRegistry().collectionChains;
  }

  getSubtypes(name: string) {
    return this.schema.getRegistry().getTypes(name);
  }
}
