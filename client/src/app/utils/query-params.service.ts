import {inject, Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  async setQueryParams(params: Record<string, string | number | boolean | readonly (string | number | boolean)[]>) {
    await this.router.navigate([], {
      queryParams: params
    });
  }

  async readDecodedQueryParams() {
    const queryParams = await firstValueFrom(this.route.queryParams);
    const transformed: Record<string, any> = {};

    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') return undefined;
      if (typeof queryParams[key] === 'object') {
        transformed[key] = queryParams[key];
      }
      try {
        const dec = decodeURIComponent(queryParams[key]);
        try {
          transformed[key] = JSON.parse(dec);
        } catch (e) {
          transformed[key] = dec;
        }
      } catch (e) {
        transformed[key] = queryParams[key];
      }
    });

    return transformed;
  }

  transformQueryParams(params: {[key: string]: any}) {
    let httpParams: Record<string, string | number | boolean | readonly (string | number | boolean)[]> = {};

    Object.keys(params).forEach((key) => {
      if (key === 'collectionFilter') {
        const value = JSON.stringify(params[key]);
        httpParams[key] = encodeURIComponent(value);
      } else if (Array.isArray(params[key])) {
        const value = JSON.stringify(params[key]);
        httpParams[key] = encodeURIComponent(value);
      } else if (['string', 'number', 'boolean'].includes(typeof params[key])) {
        httpParams[key] = String(params[key]);
      }
    });

    return httpParams;
  }

}
