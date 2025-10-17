import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CollectionName} from '../../interfaces';
import {map} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  readonly http = inject(HttpClient);


  getFilterable() {
    return this.http.get<{ collectionFilter: Record<string, CollectionName[]> }>('api/collection/filterable');
  }

  getFilterableByType(type: string, parentId?: string) {
    const params = parentId != null
      ? new HttpParams({ fromObject: { parentId } })
      : new HttpParams();

    return this.http.get<CollectionName[]>('api/collection/filterable/' + type, {
      params: params
    }).pipe(
      map(value => {
        return value.sort((a, b) => a.label.localeCompare(b.label));
      })
    );
  }

}
