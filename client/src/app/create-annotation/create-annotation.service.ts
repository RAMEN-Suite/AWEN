import { inject, Injectable } from '@angular/core';
import { AnnotationApiService } from '../api/annotation-api.service';

@Injectable({
  providedIn: 'root',
})
export class CreateAnnotationService {
  private readonly annotationAPI = inject(AnnotationApiService);
}
