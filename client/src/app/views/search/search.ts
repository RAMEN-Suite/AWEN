import {Component, inject} from '@angular/core';
import {FilterPane} from '../../filter-pane/filter-pane';
import {SearchService} from './search.service';
import {EntityList} from '../../entity-list/entity-list';

@Component({
  selector: 'app-search',
  imports: [
    FilterPane,
    EntityList
  ],
  providers: [
    SearchService
  ],
  templateUrl: './search.html',
})
export class Search {

  searchService = inject(SearchService);

  entities = this.searchService.getEntities();
  loading = this.searchService.getEntitiesLoading();

  constructor() {
  }

}
