import { Injectable, Logger } from '@nestjs/common';
import { GModel } from './interfaces/g-model.interface';
import * as fs from 'node:fs';
import { ModelRegistry } from './model.registry';
import path from 'node:path';
import { compileSchema, JsonSchema, SchemaNode } from 'json-schema-library';

@Injectable()
export class SchemaLoaderService {
  private logger = new Logger(SchemaLoaderService.name);

  private ramenModel: GModel;
  private profileModel: GModel;
  private registry: ModelRegistry;

  constructor() {
    this.loadSchemas();
  }

  private loadSchemas() {
    const gCoreSchemaJSON: JsonSchema = JSON.parse(
      fs.readFileSync(this.gCorePath(), 'utf8'),
    ) as JsonSchema;
    const gCoreSchema: SchemaNode = compileSchema(gCoreSchemaJSON);
    this.logger.log('Loading schemas...');

    const ramen: GModel = this.loadAndValidate<GModel>(
      this.ramenPath(),
      gCoreSchema,
    );
    this.logger.log(`Loaded ramen schema "${ramen.version}" successfully`);

    const profile: GModel = this.loadAndValidate<GModel>(
      this.profilePath(),
      gCoreSchema,
    );
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

  private gCorePath() {
    return path.join(process.cwd(), 'dist', 'config', 'gcore.json');
  }

  private ramenPath() {
    return path.join(process.cwd(), 'dist', 'config', 'ramen.gcore.json');
  }

  private profilePath() {
    return path.join(process.cwd(), 'dist', 'config', 'project.gcore.json');
  }

  private loadAndValidate<T>(path: string, schema: SchemaNode): T {
    const json = JSON.parse(fs.readFileSync(path, 'utf8')) as unknown;

    const result = schema.validate(json);

    if (!result.valid) {
      for (const err of result.errors) {
        this.logger.error(`Schema error: ${err.message}`, err.data);
      }
      throw new Error('Invalid schema');
    }

    return json as T;
  }
}
