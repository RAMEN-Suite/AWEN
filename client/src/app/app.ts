import {
  Component,
  computed,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ConfigService } from './config-module/config.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MenubarModule } from 'primeng/menubar';
import { Button, ButtonDirective, ButtonLabel } from 'primeng/button';
import { HealthService } from './health.service';
import { filter } from 'rxjs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Navbar } from './navbar/navbar';
import { Skeleton } from 'primeng/skeleton';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Toast,
    ProgressSpinner,
    MenubarModule,
    Button,
    ButtonDirective,
    ButtonLabel,
    ConfirmDialog,
    Navbar,
    Skeleton,
    TranslocoDirective,
  ],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly config = inject(ConfigService);
  private readonly status = inject(HealthService);
  private router = inject(Router);

  @ViewChild('appContent') private appContent!: ElementRef<HTMLDivElement>;

  protected showScrollTop = false;

  public constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollToTop('instant');
      });
  }

  protected onContentScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.showScrollTop = target.scrollTop > 300;
  }

  protected scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
    this.appContent.nativeElement.scrollTo({ top: 0, behavior: behavior });
  }

  protected readonly healthStatusLoaded = this.status.getHealthStatusLoaded();

  protected loaded = computed(() => {
    const loaded = this.config.getLoaded();
    const healthy = this.status.getHealthStatus();
    const healthStatusLoaded = this.healthStatusLoaded();
    return loaded() && healthy() && healthStatusLoaded;
  });

  protected version = this.status.getServerVersion();
  protected ramenVersion = this.status.getRamenVersion();
}
