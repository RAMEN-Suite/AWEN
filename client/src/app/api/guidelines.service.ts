import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IGuidelines} from '../../interfaces';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuidelinesService {
  readonly http = inject(HttpClient);

  get() {
    const temp = this.http.get<IGuidelines>('api/guidelines');
    return firstValueFrom(temp);
  }

}
