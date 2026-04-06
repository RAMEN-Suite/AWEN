import { Component, inject } from '@angular/core';
import { FilterPane } from '../../filter-pane/filter-pane';
import { SearchService } from './search.service';
import { EntityList } from '../../entity-list/entity-list';
import { CreateEntity } from '../../create-entity/create-entity';

@Component({
  selector: 'app-search-page',
  imports: [FilterPane, EntityList, CreateEntity],
  providers: [SearchService],
  templateUrl: './search-page.component.html',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `,
})
export class SearchPage {
  searchService = inject(SearchService);

  entities = this.searchService.getEntities();
  loading = this.searchService.getEntitiesLoading();
}
