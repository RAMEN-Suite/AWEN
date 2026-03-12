import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly _version = signal<string>('0.0.0');
  private readonly _healthy = signal<boolean>(true);

  constructor() {
    this.loadStatus();
  }

  private async loadStatus() {
    const temp = this.http.get<{ version: string; healthy: boolean }>('/api/health').pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: `The Server is not healthy. Please try again later.`,
        });
        throw err;
      }),
    );
    const res = await firstValueFrom(temp);
    this._healthy.set(res.healthy);
    this._version.set(res.version);

    if (!res.healthy) {
      this.messageService.add({
        severity: 'error',
        detail: `The Server is not healthy. Please try again later.`,
      });
    }
  }

  getVersion() {
    return this._version.asReadonly();
  }

  getHealthStatus() {
    return this._healthy.asReadonly();
  }
}
