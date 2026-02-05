import { Injectable, Logger } from '@nestjs/common';
import { GModel } from './interfaces/g-model.interface';
import * as fs from 'node:fs';
import { ModelRegistry } from './model.registry';
import path from 'node:path';

@Injectable()
export class SchemaLoaderService {
  private logger = new Logger(SchemaLoaderService.name);

  private ramenModel: GModel;
  private profileModel: GModel;
  private registry: ModelRegistry;

  constructor() {
    this.loadSchemas();
  }

  loadSchemas() {
    this.logger.log('Loading schemas...');
    const ramen: GModel = JSON.parse(
      fs.readFileSync(this.ramenPath(), 'utf8'),
    ) as GModel;
    this.logger.log(`Loaded ramen schema "${ramen.version}" successfully`);

    const profile: GModel = JSON.parse(
      fs.readFileSync(this.profilePath(), 'utf8'),
    ) as GModel;
    this.logger.log(
      `Loaded project schema "${profile.name} ${profile.version}" successfully`,
    );

    this.ramenModel = ramen;
    this.profileModel = profile;

    this.registry = new ModelRegistry(ramen, profile);
  }

  getRegistry() {
    return this.registry;
  }

  private ramenPath() {
    return path.join(process.cwd(), 'dist', 'config', 'ramen.gcore.json');
  }

  private profilePath() {
    return path.join(process.cwd(), 'dist', 'config', 'project.gcore.json');
  }
}
