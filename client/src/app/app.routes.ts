import { Routes } from '@angular/router';
import { SearchPage } from './views/searchPage/search-page.component';
import { DetailPage } from './views/detail-page/detail-page';
import { entityIdResolver } from './utils/entity-id-resolver';
import { ErrorPage } from './views/error-page/error-page';
import { ConfigPage } from './views/config-page/config-page';
import { annotationsByEntityIdResolver } from './utils/annotations-by-entity-id-resolver';

export const routes: Routes = [
  {
    path: '',
    component: SearchPage,
  },
  {
    path: 'entity/:entityId',
    component: DetailPage,
    resolve: {
      entityId: entityIdResolver,
      annotations: annotationsByEntityIdResolver,
    },
  },
  {
    path: 'config',
    component: ConfigPage,
  },
  {
    path: 'error/:status',
    component: ErrorPage,
  },
];
