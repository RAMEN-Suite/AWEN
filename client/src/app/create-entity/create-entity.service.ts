import { inject, Injectable } from '@angular/core';
import { ConfigService } from '../config-module/config.service';
import { GuidelinesService } from '../api/guidelines.service';
import { EntityApiService } from '../api/entity-api.service';

@Injectable({
  providedIn: 'root',
})
export class CreateEntityService {
  private readonly configService = inject(ConfigService);
  private readonly guidelineAPI = inject(GuidelinesService);
  private readonly entityAPI = inject(EntityApiService);

  private readonly _entityTypes = this.configService.getAllEntityTypes;

  public getEntityTypesLoaded() {
    return this.configService.getLoaded();
  }

  public getEntityTypes() {
    return this._entityTypes;
  }

  public async getEntityProperties(type: string) {
    return this.guidelineAPI.getNodeProperties(type);
  }

  public async createEntity(type: string, payload: Record<string, unknown>) {
    return await this.entityAPI.createEntity(type, payload);
  }
}
