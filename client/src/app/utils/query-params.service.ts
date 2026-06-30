import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | QueryParamValue[]
  | Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class QueryParamsService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  async setQueryParams(
    params: Record<
      string,
      string | number | boolean | readonly (string | number | boolean)[]
    >,
  ) {
    await this.router.navigate([], {
      queryParams: params,
    });
  }

  async readDecodedQueryParams() {
    const queryParams: Record<string, never> = (await firstValueFrom(
      this.route.queryParams,
    )) as Record<string, never>;
    const transformed: Record<string, never> = {};

    Object.keys(queryParams).forEach((key) => {
      if (
        queryParams[key] === undefined ||
        queryParams[key] === null ||
        queryParams[key] === ''
      )
        return undefined;
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

  transformQueryParams<T extends object>(params: T) {
    const httpParams: Record<
      string,
      string | number | boolean | readonly (string | number | boolean)[]
    > = {};

    Object.entries(params).forEach(([key, value]) => {
      if (key === 'collectionFilter') {
        httpParams[key] = encodeURIComponent(JSON.stringify(value));
      } else if (Array.isArray(value)) {
        httpParams[key] = encodeURIComponent(JSON.stringify(value));
      } else if (['string', 'number', 'boolean'].includes(typeof value)) {
        httpParams[key] = String(value);
      }
    });

    return httpParams;
  }
}
