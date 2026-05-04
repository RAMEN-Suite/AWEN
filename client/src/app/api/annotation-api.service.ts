import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnotationApiService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  async createAnnotationForEntity(entityId: string, payload: Record<string, unknown>) {
    const body = {
      entityId: entityId,
      properties: payload,
    };

    const res = this.http.post<{ id: string }>(`/api/annotation/entity`, body).pipe(
      catchError((err) => {
        if (err.error.statusCode === 400) {
          this.messageService.add({
            severity: 'error',
            summary: `Error while creating a new annotation. Please try again.`,
            detail: Array.isArray(err.error.message) ? err.error.message.join('\n') : err.error.message,
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
}
