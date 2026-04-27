import { ResolveFn } from '@angular/router';

export const entityIdResolver: ResolveFn<string> = (route) => {
  return route.paramMap.get('entityId')!;
};
