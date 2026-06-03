import { inject, Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HealthApiService, HealthStatus } from './api/health-api.service';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private readonly healthApi = inject(HealthApiService);
  private readonly messageService = inject(MessageService);

  private readonly _version = signal<string>('0.0.0');
  private readonly _healthy = signal<boolean>(true);

  constructor() {
    this.loadStatus();
  }

  private async loadStatus() {
    let res: HealthStatus;
    try {
      res = await this.healthApi.getStatus();
    } catch {
      this._healthy.set(false);
      this.messageService.add({
        severity: 'error',
        detail: `The Server is not healthy. Please try again later.`,
      });
      return;
    }

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
