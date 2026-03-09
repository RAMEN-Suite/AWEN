import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollTop } from 'primeng/scrolltop';
import { Toast } from 'primeng/toast';
import { ConfigService } from './config-module/config.service';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollTop, Toast, ProgressSpinner],
  providers: [ConfigService],
  templateUrl: './app.html',
})
export class App {
  config = inject(ConfigService);

  loaded = this.config.getLoaded();
}
