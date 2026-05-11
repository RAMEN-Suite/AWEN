import { inject, Injectable } from '@angular/core';
import { AnnotationApiService } from '../api/annotation-api.service';
import { EntityService } from '../entity.service';

@Injectable({
  providedIn: 'root',
})
export class UpdateAnnotationService {
  private readonly annotationAPI = inject(AnnotationApiService);
  private readonly entityService = inject(EntityService);

  async update(annotationId: string, payload: Record<string, unknown>) {
    await this.annotationAPI.update(annotationId, payload);
    // Reload Entity on Detail page
    await this.entityService.reloadEntity();
  }
}
