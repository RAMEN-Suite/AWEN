import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { EntityService } from '../api/entity.service';
import { Entity } from '../../interfaces';

export const entityByIdResolver: ResolveFn<Entity> = (route) => {
  const entityService = inject(EntityService);
  const entityId = route.paramMap.get('entityId')!;

  return entityService.getById(entityId);
};
