import { inject, Injectable } from '@angular/core';
import { GuidelinesService } from '../api/guidelines.service';
import { EntityApiService } from '../api/entity-api.service';

@Injectable({
  providedIn: 'root',
})
export class EditEntityService {
  guidelineAPI = inject(GuidelinesService);
  entityAPI = inject(EntityApiService);

  async getEntityProperties(type: string) {
    return this.guidelineAPI.getNodeProperties(type);
  }

  async updateEntity(id: string, payload: Record<string, unknown>) {
    return await this.entityAPI.updateEntity(id, payload);
  }
}
