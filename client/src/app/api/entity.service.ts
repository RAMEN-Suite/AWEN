import {inject, Injectable} from '@angular/core';
import {Entity, EntityNames, EntitySearchQuery} from '../../interfaces';
import {firstValueFrom} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private http = inject(HttpClient);

  searchEntities(query:EntitySearchQuery) {
    let httpParams = new HttpParams();

    (Object.keys(query) as (keyof EntitySearchQuery)[]).forEach((key) => {
      if (key === 'collectionFilter') {
        const value = JSON.stringify(query[key]);
        const encodedValue = encodeURIComponent(value);
        httpParams = httpParams.set(key, encodedValue);
      } else {
        httpParams = httpParams.set(key, query[key]);
      }

    });

    return this.http.get<Entity[]>('/api/entity/', {
      params: httpParams
    });
  }

  async getById(id:string) {
    return this.http.get<Entity>('/api/entity/' + id);
  }


  async getAutocomplete(search:string): Promise<EntityNames[]> {
    const parsedQuery = encodeURIComponent(search);
    const temp = this.http.get<EntityNames[]>('/api/entity/auto-complete/' + parsedQuery);
    return firstValueFrom(temp);
  }

}
