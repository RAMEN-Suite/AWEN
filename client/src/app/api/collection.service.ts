import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  readonly http = inject(HttpClient);


  getFilterable() {
    return this.http.get<{ collectionFilter: Record<string, {id: string, label: string}[]> }>('collection/filterable');
  }

}
