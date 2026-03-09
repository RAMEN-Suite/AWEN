import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmConfig, IGuidelines } from '../../interfaces';
import { catchError, firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class GuidelinesService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  get() {
    const temp = this.http.get<IGuidelines>('api/guidelines').pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: `Error while loading important data. Reload the page, or try again later.`,
        });
        throw err;
      }),
    );
    return firstValueFrom(temp);
  }

  getConfig() {
    const temp = this.http.get<EmConfig>('api/guidelines/config').pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: `Error while loading important data. Reload the page, or try again later.`,
        });
        throw err;
      }),
    );
    return firstValueFrom(temp);
  }
}
