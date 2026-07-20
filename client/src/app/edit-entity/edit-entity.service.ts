import { inject, Injectable } from '@angular/core';
import { GuidelinesService } from '../api/guidelines.service';
import { EntityApiService } from '../api/entity-api.service';

@Injectable({
  providedIn: 'root',
})
export class EditEntityService {
  private readonly guidelineAPI = inject(GuidelinesService);
  private readonly entityAPI = inject(EntityApiService);

  public async getEntityProperties(type: string) {
    return this.guidelineAPI.getNodeProperties(type);
  }

  public async updateEntity(id: string, payload: Record<string, unknown>) {
    return await this.entityAPI.updateEntity(id, payload);
  }
}
