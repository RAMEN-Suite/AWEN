import {inject, Injectable} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);

  async getSuggestions(search: string) {
    const temp = this.http.get<{ name: string; id: string; }[]>('/entity', {
      params: {}
    });
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
