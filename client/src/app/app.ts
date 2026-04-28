import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ConfigService } from './config-module/config.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Button, ButtonDirective, ButtonLabel } from 'primeng/button';
import { HealthService } from './api/health.service';
import { filter } from 'rxjs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ProgressSpinner, MenubarModule, Button, RouterLink, ButtonDirective, ButtonLabel, ConfirmDialog, Navbar],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  config = inject(ConfigService);
  status = inject(HealthService);
  router = inject(Router);

  @ViewChild('appContent') appContent!: ElementRef<HTMLDivElement>;

  showScrollTop = false;

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.scrollToTop('instant');
    });
  }

  onContentScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.showScrollTop = target.scrollTop > 300;
  }

  scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
    this.appContent?.nativeElement.scrollTo({ top: 0, behavior: behavior });
  }

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
