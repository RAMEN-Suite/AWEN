import { ResolveFn } from '@angular/router';
import { Annotation } from '../../interfaces';
import { inject } from '@angular/core';
import { EntityService } from '../api/entity.service';

export const annotationsByEntityIdResolver: ResolveFn<Annotation[]> = (route) => {
  const entityService = inject(EntityService);
  const entityId = route.paramMap.get('entityId')!;

  return entityService.getAnnotationsOf(entityId);
};
