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
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class EntityApiService {
  private http = inject(HttpClient);
  private queryParamService = inject(QueryParamsService);
  private readonly messageService = inject(MessageService);
  private readonly transloco = inject(TranslocoService);

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
            detail: this.transloco.translate(
              'app.services.entityApi.errors.loadingEntities',
            ),
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
          detail: this.transloco.translate(
            'app.services.entityApi.errors.loadingEntity',
            { id },
          ),
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
            detail: this.transloco.translate(
              'app.services.entityApi.errors.loadingAutocomplete',
            ),
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
            detail: this.transloco.translate(
              'app.services.entityApi.errors.loadingEntity',
              { id: entityId },
            ),
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
            detail: this.transloco.translate(
              'app.services.entityApi.errors.loadingEntity',
              { id: entityId },
            ),
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
              summary: this.transloco.translate(
                'app.services.entityApi.errors.createEntity',
              ),
              detail: Array.isArray(error.message)
                ? error.message.join('\n')
                : error.message,
              closable: true,
              sticky: true,
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.transloco.translate(
                'app.services.entityApi.errors.createEntity',
              ),
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
          detail: this.transloco.translate(
            'app.services.entityApi.errors.deleteEntity',
            { id },
          ),
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
              summary: this.transloco.translate(
                'app.services.entityApi.errors.updateEntity',
              ),
              detail: Array.isArray(error.message)
                ? error.message.join('\n')
                : error.message,
              closable: true,
              sticky: true,
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.transloco.translate(
                'app.services.entityApi.errors.updateEntity',
              ),
            });
          }
        }
        throw err;
      }),
    );
    return firstValueFrom(res);
  }
}
