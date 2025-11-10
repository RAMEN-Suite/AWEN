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
      } else if (Array.isArray(query[key])) {
        const value = JSON.stringify(query[key]);
        const encodedValue = encodeURIComponent(value);
        httpParams = httpParams.set(key, encodedValue);
      } else if (['string', 'number', 'boolean'].includes(typeof query[key])) {
        httpParams = httpParams.set(key, String(query[key]));
      }

    });

    const res = this.http.get<Entity[]>('/api/entity/', {
      params: httpParams
    });
    return firstValueFrom(res);
  }

  async getById(id:string) {
    const res = this.http.get<Entity>('/api/entity/' + id);
    return firstValueFrom(res);
  }


  async getAutocomplete(search:string): Promise<EntityNames[]> {
    const parsedQuery = encodeURIComponent(search);
    const temp = this.http.get<EntityNames[]>('/api/entity/auto-complete/' + parsedQuery);
    return firstValueFrom(temp);
  }

}
