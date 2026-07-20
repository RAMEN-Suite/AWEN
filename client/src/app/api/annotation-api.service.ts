import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { catchError, firstValueFrom, map } from 'rxjs';
import { Annotation } from '../../interfaces';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class AnnotationApiService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly transloco = inject(TranslocoService);

  public async get(id: string) {
    const res = this.http.get<Annotation>('/api/annotation/' + id).pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: this.transloco.translate(
            'app.services.annotationApi.errors.getAnnotation',
            { id },
          ),
        });
        throw err;
      }),
    );
    return await firstValueFrom(res);
  }

  public async createAnnotationForEntity(
    entityId: string,
    type: string,
    payload: Record<string, unknown>,
  ) {
    const body = {
      entityId: entityId,
      type: type,
      properties: payload,
    };

    const res = this.http
      .post<{ id: string }>(`/api/annotation/entity`, body)
      .pipe(
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
                  'app.services.annotationApi.errors.createAnnotation',
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
                  'app.services.annotationApi.errors.createAnnotation',
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

  public async delete(id: string) {
    const res = this.http.delete('/api/annotation/' + id).pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: this.transloco.translate(
            'app.services.annotationApi.errors.deleteAnnotation',
            { id },
          ),
        });
        throw err;
      }),
    );
    await firstValueFrom(res);
    return;
  }

  public async deleteOutgoingRelation(id: string, connectedNodeId: string) {
    const res = this.http
      .delete(`/api/annotation/${id}/connection/${connectedNodeId}`)
      .pipe(
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            detail: this.transloco.translate(
              'app.services.annotationApi.errors.deleteRelation',
            ),
          });
          throw err;
        }),
      );
    await firstValueFrom(res);
    return;
  }

  public async createOutgoingRelation(id: string, connectedNodeId: string) {
    const body = {
      connectionId: connectedNodeId,
    };
    const res = this.http.post(`/api/annotation/${id}/connection`, body).pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: this.transloco.translate(
            'app.services.annotationApi.errors.createRelation',
          ),
        });
        throw err;
      }),
    );
    await firstValueFrom(res);
    return;
  }

  public async update(annotationId: string, payload: Record<string, unknown>) {
    const body = {
      properties: payload,
    };

    const res = this.http.put(`/api/annotation/${annotationId}`, body).pipe(
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
                'app.services.annotationApi.errors.updateAnnotation',
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
                'app.services.annotationApi.errors.updateAnnotation',
              ),
            });
          }
        }
        throw err;
      }),
    );
    await firstValueFrom(res);
    return;
  }
}
