import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmConfigRemote, GAttribute } from '../../interfaces';
import { catchError, firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class GuidelinesService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly transloco = inject(TranslocoService);

  public getConfig() {
    const temp = this.http.get<EmConfigRemote>('/api/guidelines/config').pipe(
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          detail: this.transloco.translate(
            'app.services.guidelines.errors.loadingConfig',
          ),
        });
        throw err;
      }),
    );
    return firstValueFrom(temp);
  }

  public getNodeProperties(type: string) {
    const temp = this.http
      .get<GAttribute[]>('/api/guidelines/config/node/properties/' + type)
      .pipe(
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            detail: this.transloco.translate(
              'app.services.guidelines.errors.loadingNodeProperties',
              { type },
            ),
          });
          throw err;
        }),
      );
    return firstValueFrom(temp);
  }
}
