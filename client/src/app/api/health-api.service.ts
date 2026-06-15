import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, retry } from 'rxjs';

export interface HealthStatus {
  version: string;
  ramenVersion: string;
  healthy: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HealthApiService {
  private readonly http = inject(HttpClient);

  getStatus(): Promise<HealthStatus> {
    return firstValueFrom(
      this.http.get<HealthStatus>('/api/health').pipe(
        retry({
          delay: 3000,
        }),
      ),
    );
  }
}
