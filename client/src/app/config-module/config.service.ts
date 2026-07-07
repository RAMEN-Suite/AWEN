import { computed, inject, Injectable, signal } from '@angular/core';
import { EmConfig, EmConfigRemote } from '../../interfaces';
import { LocalStoreService } from '../utils/local-store.service';
import { GuidelinesService } from '../api/guidelines.service';

const EM_CONFIG_STORE_KEY = 'EM_CONFIG_STORE_KEY';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly store = inject(LocalStoreService);
  private readonly guidelines = inject(GuidelinesService);

  private readonly _remoteConfig = signal<EmConfigRemote>({
    collectionChains: [],
    entityTypes: [],
    annotationTypes: [],
    dataTypes: [],
    camiAvailable: false,
  });
  private readonly _config = signal<EmConfig>({
    selectedCollectionChain: [],
    filterableCollections: [],
    entityTypes: [],
  });
  private readonly _loaded = signal(false);

  public constructor() {
    void this.initConfigStore();
  }

  public camiAvailable = computed(() => this._remoteConfig().camiAvailable);

  public getConfig() {
    return this._config.asReadonly();
  }

  public getDataTypes() {
    return computed(() => {
      return this._remoteConfig().dataTypes;
    });
  }

  public getAnnotationTypes() {
    return computed(() => {
      return this._remoteConfig().annotationTypes;
    });
  }

  public findDataType(id: string) {
    return this.getDataTypes()().find((dataType) => dataType.id === id);
  }

  public setConfig(value: EmConfig) {
    this._config.set(value);
    this.store.saveData(EM_CONFIG_STORE_KEY, value);
  }

  public getRemoteConfig() {
    return this._remoteConfig.asReadonly();
  }

  public getLoaded() {
    return this._loaded.asReadonly();
  }

  private async initConfigStore() {
    const remoteConfig = await this.getConfigFromRemote();
    this._remoteConfig.set(remoteConfig);
    const storeConfig = this.store.getData<EmConfig>(EM_CONFIG_STORE_KEY);
    if (storeConfig) {
      this.setConfig(storeConfig);
    } else {
      this.setConfig({
        entityTypes: remoteConfig.entityTypes,
        filterableCollections: [],
        selectedCollectionChain: [],
      });
    }
    this._loaded.set(true);
  }

  private async getConfigFromRemote(): Promise<EmConfigRemote> {
    return this.guidelines.getConfig();
  }
}
