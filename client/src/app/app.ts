import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollTop } from 'primeng/scrolltop';
import { Toast } from 'primeng/toast';
import { ConfigService } from './config-module/config.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollTop, Toast],
  providers: [ConfigService],
  templateUrl: './app.html',
})
export class App {}
