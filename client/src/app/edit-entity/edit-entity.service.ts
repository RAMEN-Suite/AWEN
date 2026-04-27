import { inject, Injectable } from '@angular/core';
import { GuidelinesService } from '../api/guidelines.service';
import { EntityService } from '../api/entity.service';

@Injectable({
  providedIn: 'root',
})
export class EditEntityService {
  guidelineAPI = inject(GuidelinesService);
  entityAPI = inject(EntityService);

  async getEntityProperties(type: string) {
    return this.guidelineAPI.getEntityProperties(type);
  }

  async updateEntity(id: string, payload: Record<string, unknown>) {
    return await this.entityAPI.updateEntity(id, payload);
  }
}
