import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

type QueryParamPrimitive = string | number | boolean;
type EncodedQueryParamValue =
  QueryParamPrimitive | readonly QueryParamPrimitive[];
type EncodedQueryParams = Record<string, EncodedQueryParamValue>;
type DecodedQueryParams = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class QueryParamsService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public setQueryParams(params: EncodedQueryParams): Promise<boolean> {
    return this.router.navigate([], {
      queryParams: params,
    });
  }

  public async readDecodedQueryParams<
    T extends DecodedQueryParams = DecodedQueryParams,
  >(): Promise<T> {
    const queryParams: DecodedQueryParams = await firstValueFrom(
      this.route.queryParams,
    );
    const transformed: DecodedQueryParams = {};

    for (const [key, value] of Object.entries(queryParams)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }

      if (Array.isArray(value)) {
        transformed[key] = value.map((entry) =>
          this.decodeQueryParamValue(entry),
        );
        continue;
      }

      transformed[key] = this.decodeQueryParamValue(value);
    }

    return transformed as T;
  }

  public transformQueryParams(params: object): EncodedQueryParams {
    const httpParams: EncodedQueryParams = {};

    Object.entries(params).forEach(([key, value]) => {
      const encodedValue = this.encodeQueryParamValue(value);
      if (encodedValue !== undefined) {
        httpParams[key] = encodedValue;
      }
    });

    return httpParams;
  }

  private encodeQueryParamValue(
    value: unknown,
  ): EncodedQueryParamValue | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (Array.isArray(value) || typeof value === 'object') {
      return encodeURIComponent(JSON.stringify(value));
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return undefined;
  }

  private decodeQueryParamValue(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value;
    }

    let decoded: string;
    try {
      decoded = decodeURIComponent(value);
    } catch {
      return value;
    }

    try {
      return JSON.parse(decoded) as unknown;
    } catch {
      return decoded;
    }
  }
}
