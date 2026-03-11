import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ScrollTop } from 'primeng/scrolltop';
import { Toast } from 'primeng/toast';
import { ConfigService } from './config-module/config.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Button, ButtonDirective, ButtonLabel } from 'primeng/button';
import { HealthService } from './api/health.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollTop, Toast, ProgressSpinner, MenubarModule, Button, RouterLink, ButtonDirective, ButtonLabel],
  providers: [ConfigService, HealthService],
  styles: `
    .configMenuBar {
      position: fixed;
      bottom: 16px;
      right: 16px;
    }
  `,
  templateUrl: './app.html',
})
export class App {
  config = inject(ConfigService);
  status = inject(HealthService);

  loaded = computed(() => {
    const loaded = this.config.getLoaded();
    const healthy = this.status.getHealthStatus();
    return loaded() && healthy();
  });

  version = this.status.getVersion();

  protected menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: [''],
    },
  ];
}
