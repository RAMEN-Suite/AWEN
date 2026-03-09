import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStoreService {
  public saveData<T>(key: string, value: T) {
    const parsedVal = JSON.stringify(value);
    localStorage.setItem(key, parsedVal);
  }

  public getData<T>(key: string): T | undefined {
    const val = localStorage.getItem(key);
    if (val === null) return undefined;

    try {
      return JSON.parse(val) as T;
    } catch {
      return undefined;
    }
  }

  public removeData(key: string) {
    localStorage.removeItem(key);
  }

  public clearData() {
    localStorage.clear();
  }
}
