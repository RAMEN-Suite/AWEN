import {inject, Injectable} from '@angular/core';
import {Entity, EntityAutocompleteQuery, EntityNames, EntitySearchQuery} from '../../interfaces';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {QueryParamsService} from '../utils/query-params.service';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private http = inject(HttpClient);
  private queryParamService = inject(QueryParamsService);

  searchEntities(query:EntitySearchQuery) {
    const httpParams = this.queryParamService.transformQueryParams(query);

    const res = this.http.get<Entity[]>('/api/entity/', {
      params: httpParams
    });
    return firstValueFrom(res);
  }

  async getById(id:string) {
    const res = this.http.get<Entity>('/api/entity/' + id);
    return firstValueFrom(res);
  }


  async getAutocomplete(search:string, query: EntityAutocompleteQuery): Promise<EntityNames[]> {
    const parsedQuery = encodeURIComponent(search);
    const httpParams = this.queryParamService.transformQueryParams(query);
    const temp = this.http.get<EntityNames[]>('/api/entity/auto-complete/' + parsedQuery, {
      params: httpParams
    });
    return firstValueFrom(temp);
  }

}
