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

  private readonly _remoteConfig = signal<EmConfig>({ collectionChains: [], entityTypes: [] });
  private readonly _config = signal<EmConfig>({ collectionChains: [], entityTypes: [] });
  private readonly _loaded = signal(false);

  constructor() {
    this.initConfigStore();
  }

  getConfig() {
    return this._config.asReadonly();
  }

  setConfig(value: EmConfig) {
    this._config.set(value);
    this.store.saveData(EM_CONFIG_STORE_KEY, value);
  }

  getRemoteConfig() {
    return this._remoteConfig.asReadonly();
  }

  getLoaded() {
    return this._loaded.asReadonly();
  }

  private async initConfigStore() {
    const remoteConfig = await this.getConfigFromRemote();
    this._remoteConfig.set(remoteConfig);
    const storeConfig = this.store.getData<EmConfig>(EM_CONFIG_STORE_KEY);
    if (storeConfig) {
      this.setConfig(storeConfig);
    } else {
      this.setConfig(remoteConfig);
    }
    this._loaded.set(true);
    console.log(this._config.asReadonly());
  }

  private async getConfigFromRemote(): Promise<EmConfig> {
    return this.guidelines.getConfig();
  }
}
