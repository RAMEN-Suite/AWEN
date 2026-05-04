import { inject, Injectable } from '@angular/core';
import { AnnotationApiService } from '../api/annotation-api.service';
import { EntityService } from '../entity.service';

@Injectable({
  providedIn: 'root',
})
export class CreateAnnotationService {
  private readonly annotationAPI = inject(AnnotationApiService);
  private readonly entityService = inject(EntityService);

  async createAnnotationForEntity(entityId: string, payload: Record<string, unknown>) {
    const id = await this.annotationAPI.createAnnotationForEntity(entityId, payload);
    // Reload Entity on Detail page
    await this.entityService.reloadEntity();
    return id;
  }
}
