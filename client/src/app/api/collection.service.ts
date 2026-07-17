import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CollectionName } from '../../interfaces';
import { catchError, map, of } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  public getFilterable() {
    return this.http.get<{
      collectionFilter: Record<string, CollectionName[]>;
    }>('api/collection/filterable');
  }

  public getFilterableByType(type: string, parentId?: string) {
    const params =
      parentId != null
        ? new HttpParams({ fromObject: { parentId } })
        : new HttpParams();

    const collator = new Intl.Collator('en', {
      numeric: true,
      sensitivity: 'base',
    });

    return this.http
      .get<CollectionName[]>('/api/collection/filterable/' + type, {
        params: params,
      })
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            detail: `Error while loading filter. Reload the page, or try again later.`,
          });

          return of(new Array<CollectionName>());
        }),
        map((value) => {
          return value.sort((a, b) => {
            return collator.compare(a.label, b.label);
          });
        }),
      );
  }
}
