import { inject, Injectable } from '@angular/core';
import { Entity } from '../../interfaces';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CamiApiService {
  private readonly http = inject(HttpClient);

  public async redirectToCollections(id: string) {
    const res = this.http.get<Entity>('/api/cami/collections/' + id);
    return firstValueFrom(res);
  }

  public async redirectToContents(id: string) {
    const res = this.http.get<Entity>('/api/cami/contents/' + id);
    return firstValueFrom(res);
  }
}
