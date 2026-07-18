import { Injectable } from '@angular/core';
import { EmConfig } from '../../interfaces';

interface StorageMap {
  EM_CONFIG_STORE_KEY: EmConfig;
}

@Injectable({
  providedIn: 'root',
})
export class LocalStoreService {
  public saveData<K extends keyof StorageMap>(
    key: K,
    value: StorageMap[K],
  ): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public getData<K extends keyof StorageMap>(
    key: K,
  ): StorageMap[K] | undefined {
    const value = localStorage.getItem(key);

    if (value === null) {
      return undefined;
    }

    return JSON.parse(value) as StorageMap[K];
  }

  public removeData(key: keyof StorageMap) {
    localStorage.removeItem(key);
  }

  public clearData() {
    localStorage.clear();
  }
}
