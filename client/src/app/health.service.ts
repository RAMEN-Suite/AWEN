import { inject, Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HealthApiService, HealthStatus } from './api/health-api.service';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private readonly healthApi = inject(HealthApiService);
  private readonly messageService = inject(MessageService);

  private readonly _statusLoaded = signal<boolean>(false);
  private readonly _version = signal<string>('0.0.0');
  private readonly _ramenVersion = signal<string>('0.0.0');
  private readonly _healthy = signal<boolean>(true);

  public constructor() {
    void this.loadStatus().finally(() => this._statusLoaded.set(true));
  }

  private async loadStatus() {
    try {
      const res: HealthStatus = await this.healthApi.getStatus();

      this._healthy.set(res.healthy);
      this._version.set(res.version);
      this._ramenVersion.set(res.ramenVersion);

      if (!res.healthy) {
        this.messageService.add({
          severity: 'error',
          detail: `The Server is not healthy. Please try again later.`,
        });
      }
    } catch {
      this._healthy.set(false);
      this.messageService.add({
        severity: 'error',
        detail: `The Server is not healthy. Please try again later.`,
      });
      return;
    }
  }

  public getHealthStatusLoaded() {
    return this._statusLoaded.asReadonly();
  }

  public getServerVersion() {
    return this._version.asReadonly();
  }

  public getRamenVersion() {
    return this._ramenVersion.asReadonly();
  }

  public getHealthStatus() {
    return this._healthy.asReadonly();
  }
}
