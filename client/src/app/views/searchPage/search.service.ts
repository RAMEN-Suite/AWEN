import { inject, Injectable, signal } from '@angular/core';
import { EntityService } from '../../api/entity.service';
import { Entity, EntityAutocompleteQuery, EntitySearchQuery } from '../../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  entityService = inject(EntityService);

  private entities = signal<Entity[]>([]);
  private entitiesLoading = signal<boolean>(false);

  async getSuggestions(search: string, query: EntityAutocompleteQuery) {
    return await this.entityService.getAutocomplete(search, query);
  }

  getEntitiesLoading() {
    return this.entitiesLoading.asReadonly();
  }

  getEntities() {
    return this.entities.asReadonly();
  }

  resetEntityList() {
    this.entities.set(new Array<Entity>());
  }

  async searchEntities(query: EntitySearchQuery) {
    this.entitiesLoading.set(true);
    const entities = await this.entityService.searchEntities(query);
    if (Array.isArray(entities)) {
      this.entities.set(entities);
    } else {
      this.entities.set(new Array<Entity>());
    }
    this.entitiesLoading.set(false);
    return this;
  }
}
