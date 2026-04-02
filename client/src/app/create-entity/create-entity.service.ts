import { computed, inject, Injectable } from '@angular/core';
import { ConfigService } from '../config-module/config.service';
import { GuidelinesService } from '../api/guidelines.service';
import { EntityService } from '../api/entity.service';

@Injectable({
  providedIn: 'root',
})
export class CreateEntityService {
  configService = inject(ConfigService);
  guidelineAPI = inject(GuidelinesService);
  entityAPI = inject(EntityService);

  private readonly _config = this.configService.getConfig();
  private readonly _entityTypes = computed(() => {
    return this._config().entityTypes;
  });

  getEntityTypesLoaded() {
    return this.configService.getLoaded();
  }

  getEntityTypes() {
    return this._entityTypes;
  }

  async getEntityProperties(type: string) {
    return this.guidelineAPI.getEntityProperties(type);
  }

  async createEntity(payload: Record<string, unknown>) {
    return await this.entityAPI.createEntity(payload);
  }
}
