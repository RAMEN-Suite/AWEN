import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmConfigRemote, GAttribute } from '../../interfaces';
import { catchError, firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class GuidelinesService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  public getConfig() {
    const temp = this.http.get<EmConfigRemote>('/api/guidelines/config').pipe(
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

  public getNodeProperties(type: string) {
    const temp = this.http
      .get<GAttribute[]>('/api/guidelines/config/node/properties/' + type)
      .pipe(
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            detail: `Could not load Attributes of node type ${type}. Reload the page, or try again later.`,
          });
          throw err;
        }),
      );
    return firstValueFrom(temp);
  }
}
