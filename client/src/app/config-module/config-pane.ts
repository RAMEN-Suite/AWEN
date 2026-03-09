import { Component, inject } from '@angular/core';
import { ConfigService } from './config.service';

@Component({
  selector: 'app-config-pane',
  imports: [],
  templateUrl: './config-pane.html',
})
export class ConfigPane {
  private configService: ConfigService = inject(ConfigService);

  config = this.configService.getConfig();
}
