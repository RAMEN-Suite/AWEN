import { Component, inject } from '@angular/core';
import { FilterPane } from '../../filter-pane/filter-pane';
import { SearchEntityService } from '../../search-entity.service';
import { EntityList } from '../../entity-list/entity-list';
import { OldEntity } from '../../../interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-page',
  imports: [FilterPane, EntityList],
  providers: [SearchEntityService],
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
  private router = inject(Router);
  private searchService = inject(SearchEntityService);

  protected entities = this.searchService.getEntities();
  protected loading = this.searchService.getEntitiesLoading();

  protected navigateToDetailPage = async (entity: OldEntity) => {
    await this.router.navigate(['entity', entity.id]);
  };
}
