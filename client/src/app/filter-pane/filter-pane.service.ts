import {inject, Injectable} from '@angular/core';
import {EntityService} from '../api/entity.service';
import {Entity, EntitySearchQuery} from '../../interfaces';
import {firstValueFrom} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FilterPaneService {

  entityService = inject(EntityService);

  async getSuggestions(search: string) {
    return await this.entityService.getAutocomplete(search);
  }

  async searchEntities(query:EntitySearchQuery) {
    const resp = this.entityService.searchEntities(query);
    const entities = await firstValueFrom(resp);
    if (Array.isArray(entities)) {
      return entities;
    }
    return new Array<Entity>()
  }


  private transformSuggestions(entities: any[]): { name: string; id: string }[] {
    return entities.map((entity) => {
      // TODO: guidelines
      return {
        name: entity.properties.label,
        id: entity.properties.id,
      }
    })
  }

}
