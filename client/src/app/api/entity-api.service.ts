import { inject, Injectable } from '@angular/core';
import {
  OldEntity,
  EntityAutocompleteQuery,
  EntityNames,
  EntitySearchQuery,
  Entity,
  AnnotationOfEntityWithContent,
  AnnotationOfEntity,
} from '../../interfaces';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { QueryParamsService } from '../utils/query-params.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class EntityApiService {
  private http = inject(HttpClient);
  private queryParamService = inject(QueryParamsService);
  private readonly messageService = inject(MessageService);

  public searchEntities(query: EntitySearchQuery) {
    const httpParams = this.queryParamService.transformQueryParams(query);

    const res = this.http
      .get<OldEntity[]>('/api/entity/', {
        params: httpParams,
      })
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            detail: `Error while loading entities. Reload the page, or try again later.`,
          });
          return of(new Array<OldEntity>());
        }),
      );
    return firstValueFrom(res);
  }

  public async getById(id: string) {
    const res = this.http.get<Entity>('/api/entity/' + id).pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: `Error while loading entity with id ${id}. Reload the page, or try again later.`,
        });
        throw err;
      }),
    );
    return firstValueFrom(res);
  }

  public async getAutocomplete(
    search: string,
    query?: EntityAutocompleteQuery,
  ): Promise<EntityNames[]> {
    const parsedQuery = encodeURIComponent(search);
    const httpParams = query
      ? this.queryParamService.transformQueryParams(query)
      : undefined;
    const temp = this.http
      .get<EntityNames[]>('/api/entity/auto-complete/' + parsedQuery, {
        params: httpParams,
      })
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            detail: `Error while loading autocomplete. Reload the page, or try again later.`,
          });
          return of(new Array<EntityNames>());
        }),
      );
    return firstValueFrom(temp);
  }

  public async getAnnotationsOf(entityId: string) {
    const res = this.http
      .get<AnnotationOfEntity[]>(`/api/entity/${entityId}/annotations`)
      .pipe(
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            detail: `Error while loading entity with id ${entityId}. Reload the page, or try again later.`,
          });
          throw err;
        }),
      );
    return firstValueFrom(res);
  }

  public async getAnnotationsWithConnectionsOf(entityId: string) {
    const res = this.http
      .get<AnnotationOfEntityWithContent[]>(
        `/api/entity/${entityId}/annotations/content`,
      )
      .pipe(
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            detail: `Error while loading entity with id ${entityId}. Reload the page, or try again later.`,
          });
          throw err;
        }),
      );
    return firstValueFrom(res);
  }

  public async createEntity(type: string, payload: Record<string, unknown>) {
    const body = {
      type: type,
      properties: payload,
    };

    const res = this.http.post<{ id: string }>(`/api/entity`, body).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          const error = err.error as {
            statusCode?: number;
            message?: string | string[];
          };
          if (error.statusCode === 400) {
            this.messageService.add({
              severity: 'error',
              summary: `Error while creating a new entity. Please try again.`,
              detail: Array.isArray(error.message)
                ? error.message.join('\n')
                : error.message,
              closable: true,
              sticky: true,
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: `Error while creating a new entity. Please try again.`,
            });
          }
        }
        throw err;
      }),
      map((value) => {
        return value.id;
      }),
    );
    return firstValueFrom(res);
  }

  public async deleteEntity(id: string) {
    const res = this.http.delete('/api/entity/' + id).pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: `Error while deleting entity with id ${id}. Try again later.`,
        });
        throw err;
      }),
    );
    await firstValueFrom(res);
    return;
  }

  public async updateEntity(id: string, payload: Record<string, unknown>) {
    const body = {
      properties: payload,
    };

    const res = this.http.put(`/api/entity/${id}`, body).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          const error = err.error as {
            statusCode?: number;
            message?: string | string[];
          };
          if (error.statusCode === 400) {
            this.messageService.add({
              severity: 'error',
              summary: `Error while updating a entity. Please try again.`,
              detail: Array.isArray(error.message)
                ? error.message.join('\n')
                : error.message,
              closable: true,
              sticky: true,
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: `Error while updating a entity. Please try again.`,
            });
          }
        }
        throw err;
      }),
    );
    return firstValueFrom(res);
  }
}
