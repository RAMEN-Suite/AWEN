import { inject, Injectable, signal } from '@angular/core';
import { EntityApiService } from './api/entity-api.service';
import {
  OldEntity,
  EntityAutocompleteQuery,
  EntitySearchQuery,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SearchEntityService {
  private readonly entityApi = inject(EntityApiService);

  private entities = signal<OldEntity[]>([]);
  private entitiesLoading = signal<boolean>(false);

  public async getSuggestions(search: string, query: EntityAutocompleteQuery) {
    return await this.entityApi.getAutocomplete(search, query);
  }

  public getEntitiesLoading() {
    return this.entitiesLoading.asReadonly();
  }

  public getEntities() {
    return this.entities.asReadonly();
  }

  public resetEntityList() {
    this.entities.set(new Array<OldEntity>());
  }

  public async searchEntities(query: EntitySearchQuery) {
    this.entitiesLoading.set(true);
    const entities = await this.entityApi.searchEntities(query);
    if (Array.isArray(entities)) {
      this.entities.set(entities);
    } else {
      this.entities.set(new Array<OldEntity>());
    }
    this.entitiesLoading.set(false);
    return this;
  }
}
