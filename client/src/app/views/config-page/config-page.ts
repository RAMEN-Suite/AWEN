import { Component } from '@angular/core';
import { ConfigPane } from '../../config-module/config-pane';

@Component({
  selector: 'app-config-page',
  imports: [ConfigPane],
  templateUrl: './config-page.html',
})
export class ConfigPage {}
