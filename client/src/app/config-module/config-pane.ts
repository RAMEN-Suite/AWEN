import { Component, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'app-config-pane',
  imports: [ReactiveFormsModule, MultiSelect],
  templateUrl: './config-pane.html',
})
export class ConfigPane {
  private configService: ConfigService = inject(ConfigService);

  configOptions = this.configService.getRemoteConfig();
  config = this.configService.getConfig();

  configForm = new FormGroup({
    collectionChains: new FormControl<string[][]>([], { nonNullable: true }),
    entityTypes: new FormControl<string[]>([], { nonNullable: true }),
  });
}
