import { Routes } from '@angular/router';
import {SearchPage} from './views/searchPage/search-page.component';
import {DetailPage} from './views/detail-page/detail-page';
import {entityByIdResolver} from './utils/entity-by-id-resolver';

export const routes: Routes = [
  {
    path: '',
    component: SearchPage
  },
  {
    path: 'entity/:entityId',
    component: DetailPage,
    resolve: {
      entity: entityByIdResolver,
    }
  }
];
