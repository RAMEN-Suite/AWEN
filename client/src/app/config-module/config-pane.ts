import { Component, effect, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { FloatLabel } from 'primeng/floatlabel';
import { EmConfig } from '../../interfaces';

@Component({
  selector: 'app-config-pane',
  imports: [ReactiveFormsModule, MultiSelect, FloatLabel],
  templateUrl: './config-pane.html',
})
export class ConfigPane {
  private configService: ConfigService = inject(ConfigService);

  configOptions = this.configService.getRemoteConfig();
  config = this.configService.getConfig();
  loaded = this.configService.getLoaded();

  configForm = new FormGroup({
    collectionChains: new FormControl<string[][]>([[]], { nonNullable: true }),
    entityTypes: new FormControl<string[]>([], { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const config = this.config();
      const loaded = this.loaded();

      this.configForm.patchValue(
        {
          collectionChains: config.collectionChains,
          entityTypes: config.entityTypes,
        },
        { emitEvent: false },
      );

      if (loaded) {
        this.configForm.enable({ emitEvent: false });
      } else {
        this.configForm.disable({ emitEvent: false });
      }
    });

    this.configForm.valueChanges.subscribe((value) => {
      this.configService.setConfig({
        collectionChains: value.collectionChains ?? [],
        entityTypes: value.entityTypes ?? [],
      });
    });
  }

  displayCollectionChain(chain: string[]) {
    return chain.join('-->');
  }

  applyConfig(config: EmConfig) {
    this.configService.setConfig(config);
  }
}
