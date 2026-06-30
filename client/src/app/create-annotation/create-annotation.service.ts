import { inject, Injectable } from '@angular/core';
import { AnnotationApiService } from '../api/annotation-api.service';
import { EntityService } from '../entity.service';
import { ConfigService } from '../config-module/config.service';
import { GuidelinesService } from '../api/guidelines.service';

@Injectable({
  providedIn: 'root',
})
export class CreateAnnotationService {
  private readonly configService = inject(ConfigService);
  private readonly guidelineAPI = inject(GuidelinesService);
  private readonly annotationAPI = inject(AnnotationApiService);
  private readonly entityService = inject(EntityService);

  async createAnnotationForEntity(
    entityId: string,
    type: string,
    payload: Record<string, unknown>,
  ) {
    const id = await this.annotationAPI.createAnnotationForEntity(
      entityId,
      type,
      payload,
    );
    // Reload Entity on Detail page
    await this.entityService.reloadEntity();
    return id;
  }

  getAnnotationTypes() {
    return this.configService.getAnnotationTypes();
  }

  async getAnnotationProperties(type: string) {
    return this.guidelineAPI.getNodeProperties(type);
  }

  geAnnotationTypesLoaded() {
    return this.configService.getLoaded();
  }
}
