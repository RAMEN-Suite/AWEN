import {inject, Injectable} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {EntityNames} from '../../../interfaces';
import {DefaultUrlSerializer} from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);

  async getSuggestions(search: string) {
    const parsedQuery = encodeURIComponent(search);
    const temp = this.http.get<EntityNames[]>('/api/entity/auto-complete/' + parsedQuery);
    return firstValueFrom(temp);
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
