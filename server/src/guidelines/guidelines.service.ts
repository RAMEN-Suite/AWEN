import { Injectable } from '@nestjs/common';
import guidelinesJSON from '../../guidelines.json';
import { IGuidelines } from '../../shared/IGuidelines';
import { EmConfig } from './interfaces/em-config.interface';
import { RamenModelService } from '../schema/ramen-model.service';
import { ENTITY_LABEL_NAME } from '../constants';

@Injectable()
export class GuidelinesService {
  constructor(private readonly model: RamenModelService) {}

  // eslint-disable-next-line
  async get(): Promise<IGuidelines> {
    return guidelinesJSON as IGuidelines;
  }

  getConfig(): EmConfig {
    return {
      collectionChains: this.model.getCollectionChains(),
      entityTypes: this.model.getSubtypes(ENTITY_LABEL_NAME),
    } satisfies EmConfig;
  }

  getEntityProperties(type: string) {
    const node = this.model.getNodeType(type);
    return node.attributes.filter((attribute) => !attribute.isKey);
  }
}
