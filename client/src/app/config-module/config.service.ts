import { inject, Injectable, signal } from '@angular/core';
import { EmConfig } from '../../interfaces';
import { LocalStoreService } from '../utils/local-store.service';
import { GuidelinesService } from '../api/guidelines.service';

const EM_CONFIG_STORE_KEY = 'EM_CONFIG_STORE_KEY';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly store = inject(LocalStoreService);
  private readonly guidelines = inject(GuidelinesService);

  private readonly _config = signal<EmConfig>({ collectionChains: [], entityTypes: [] });

  constructor() {
    this.initConfigStore();
  }

  getConfig() {
    return this._config.asReadonly();
  }

  private async initConfigStore() {
    const storeConfig = this.store.getData<EmConfig>(EM_CONFIG_STORE_KEY);
    if (storeConfig) {
      this.setConfig(storeConfig);
    } else {
      const remoteConfig = await this.getConfigFromRemote();
      this.setConfig(remoteConfig);
    }
  }

  private async getConfigFromRemote(): Promise<EmConfig> {
    return this.guidelines.getConfig();
  }

  private setConfig(value: EmConfig) {
    this._config.set(value);
  }
}
