import { ResolveFn } from '@angular/router';
import { Annotation } from '../../interfaces';
import { inject } from '@angular/core';
import { EntityApiService } from '../api/entity-api.service';

export const annotationsByEntityIdResolver: ResolveFn<Annotation[]> = (route) => {
  const entityService = inject(EntityApiService);
  const entityId = route.paramMap.get('entityId')!;

  return entityService.getAnnotationsWithConnectionsOf(entityId);
};
