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
    :host {
      display: block;
      height: 100%;
    }

    .app-shell {
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      flex: 0 0 auto;
    }

    .app-content {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: scroll;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }

    .loading-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
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
