import { Component, effect, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { FloatLabel } from 'primeng/floatlabel';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-config-pane',
  imports: [ReactiveFormsModule, MultiSelect, FloatLabel, Select],
  templateUrl: './config-pane.html',
})
export class ConfigPane {
  private configService: ConfigService = inject(ConfigService);

  configOptions = this.configService.getRemoteConfig();
  config = this.configService.getConfig();
  loaded = this.configService.getLoaded();

  configForm = new FormGroup({
    filterableCollections: new FormControl<string[]>({ value: [], disabled: true }, { nonNullable: true }),
    selectedCollectionChain: new FormControl<string[]>([], { nonNullable: true }),
    entityTypes: new FormControl<string[]>([], { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const config = this.config();
      const loaded = this.loaded();

      this.configForm.patchValue(
        {
          filterableCollections: config.filterableCollections,
          selectedCollectionChain: config.selectedCollectionChain,
          entityTypes: config.entityTypes,
        },
        { emitEvent: false },
      );

      if (loaded) {
        this.configForm.enable({ emitEvent: false });
      } else {
        this.configForm.disable({ emitEvent: false });
      }

      if (this.configForm.controls.selectedCollectionChain.value.length > 0) {
        this.configForm.controls.filterableCollections.enable({ emitEvent: false });
      } else {
        this.configForm.controls.filterableCollections.disable({ emitEvent: false });
      }
    });

    this.configForm.valueChanges.subscribe((value) => {
      this.configService.setConfig({
        filterableCollections: value.filterableCollections ?? [],
        selectedCollectionChain: value.selectedCollectionChain ?? [],
        entityTypes: value.entityTypes ?? [],
      });
    });
  }

  displayCollectionChain(chain: string[]) {
    return chain.join('-->');
  }
}
