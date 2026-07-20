import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ConfigPane } from '../../config-module/config-pane';

@Component({
  selector: 'app-config-page',
  imports: [ConfigPane],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './config-page.html',
})
export class ConfigPage {}
