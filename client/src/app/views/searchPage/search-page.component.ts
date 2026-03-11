import { Component, inject } from '@angular/core';
import { FilterPane } from '../../filter-pane/filter-pane';
import { SearchService } from './search.service';
import { EntityList } from '../../entity-list/entity-list';

@Component({
  selector: 'app-search-page',
  imports: [FilterPane, EntityList],
  providers: [SearchService],
  templateUrl: './search-page.component.html',
})
export class SearchPage {
  searchService = inject(SearchService);

  entities = this.searchService.getEntities();
  loading = this.searchService.getEntitiesLoading();
}
