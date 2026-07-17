import { Routes } from '@angular/router';
import { SearchPage } from './views/searchPage/search-page.component';
import { DetailPage } from './views/detail-page/detail-page';
import { ErrorPage } from './views/error-page/error-page';
import { ConfigPage } from './views/config-page/config-page';

export const routes: Routes = [
  {
    path: '',
    component: SearchPage,
  },
  {
    path: 'entity/:entityId',
    component: DetailPage,
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
