import {inject, Injectable} from '@angular/core';
import {EntityService} from '../../api/entity.service';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  entityService = inject(EntityService);

  async getSuggestions(search: string) {
    return await this.entityService.getAutocomplete(search);
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
