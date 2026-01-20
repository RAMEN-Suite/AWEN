import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export type QueryParamValue = string | number | boolean | null | undefined | QueryParamValue[] | Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class QueryParamsService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  async setQueryParams(params: Record<string, string | number | boolean | readonly (string | number | boolean)[]>) {
    await this.router.navigate([], {
      queryParams: params,
    });
  }

  async readDecodedQueryParams() {
    const queryParams: Record<string, never> = (await firstValueFrom(this.route.queryParams)) as Record<string, never>;
    const transformed: Record<string, never> = {};

    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') return undefined;
      if (typeof queryParams[key] === 'object') {
        transformed[key] = queryParams[key];
      }
      try {
        const dec = decodeURIComponent(queryParams[key]);
        try {
          transformed[key] = JSON.parse(dec) as never;
        } catch {
          transformed[key] = dec as never;
        }
      } catch {
        transformed[key] = queryParams[key];
      }
    });

    return transformed;
  }

  transformQueryParams<T extends Record<string, QueryParamValue>>(params: T) {
    const httpParams: Record<string, string | number | boolean | readonly (string | number | boolean)[]> = {};

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
