import { Component } from '@angular/core';
import { ConfigPane } from '../../config-module/config-pane';
import { BackButtonComponent } from '../../utils/back-button.component';

@Component({
  selector: 'app-config-page',
  imports: [ConfigPane, BackButtonComponent],
  templateUrl: './config-page.html',
})
export class ConfigPage {}
