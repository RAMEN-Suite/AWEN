import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { catchError, firstValueFrom, map } from 'rxjs';
import { Annotation } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AnnotationApiService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  async get(id: string) {
    const res = this.http.get<Annotation>('/api/annotation/' + id).pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: `Error while getting Annotation with id ${id}. Try again later.`,
        });
        throw err;
      }),
    );
    return await firstValueFrom(res);
  }

  async createAnnotationForEntity(
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
          if (err.error.statusCode === 400) {
            this.messageService.add({
              severity: 'error',
              summary: `Error while creating a new annotation. Please try again.`,
              detail: Array.isArray(err.error.message)
                ? err.error.message.join('\n')
                : err.error.message,
              closable: true,
              sticky: true,
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: `Error while creating a new annotation. Please try again.`,
            });
          }
          throw err;
        }),
        map((value) => {
          return value.id;
        }),
      );
    return firstValueFrom(res);
  }

  async delete(id: string) {
    const res = this.http.delete<void>('/api/annotation/' + id).pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: `Error while deleting Annotation with id ${id}. Try again later.`,
        });
        throw err;
      }),
    );
    await firstValueFrom(res);
    return;
  }

  async deleteOutgoingRelation(id: string, connectedNodeId: string) {
    const res = this.http
      .delete<void>(`/api/annotation/${id}/connection/${connectedNodeId}`)
      .pipe(
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            detail: `Error while deleting Annotation-Relation. Try again later.`,
          });
          throw err;
        }),
      );
    await firstValueFrom(res);
    return;
  }

  async createOutgoingRelation(id: string, connectedNodeId: string) {
    const body = {
      connectionId: connectedNodeId,
    };
    const res = this.http
      .post<void>(`/api/annotation/${id}/connection`, body)
      .pipe(
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            detail: `Error while creating Annotation-Relation. Try again later.`,
          });
          throw err;
        }),
      );
    await firstValueFrom(res);
    return;
  }

  async update(annotationId: string, payload: Record<string, unknown>) {
    const body = {
      properties: payload,
    };

    const res = this.http
      .put<void>(`/api/annotation/${annotationId}`, body)
      .pipe(
        catchError((err) => {
          if (err.error.statusCode === 400) {
            this.messageService.add({
              severity: 'error',
              summary: `Error while updating an annotation. Please try again.`,
              detail: Array.isArray(err.error.message)
                ? err.error.message.join('\n')
                : err.error.message,
              closable: true,
              sticky: true,
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: `Error while updating an annotation. Please try again.`,
            });
          }
          throw err;
        }),
      );
    await firstValueFrom(res);
    return;
  }
}
