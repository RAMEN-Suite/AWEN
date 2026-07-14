import { Component, inject, OnInit, signal } from '@angular/core';
import { FilterPane } from '../../filter-pane/filter-pane';
import { SearchEntityService } from '../../search-entity.service';
import { EntityList } from '../../entity-list/entity-list';
import { OldEntity } from '../../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search-page',
  imports: [FilterPane, EntityList],
  providers: [SearchEntityService],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchEntityService);

  protected entities = this.searchService.getEntities();
  protected loading = this.searchService.getEntitiesLoading();
  protected readonly hasSearched = signal(false);
  protected readonly animationsEnabled = signal(false);

  public ngOnInit(): void {
    const hasQueryParams = this.route.snapshot.queryParamMap.has('label');
    if (hasQueryParams) {
      this.hasSearched.set(true);
      requestAnimationFrame(() => {
        this.animationsEnabled.set(true);
      });
    } else {
      this.animationsEnabled.set(true);
    }
  }

  protected navigateToDetailPage = async (entity: OldEntity) => {
    await this.router.navigate(['entity', entity.id]);
  };

  protected onSearch(): void {
    this.hasSearched.set(true);
  }
}
