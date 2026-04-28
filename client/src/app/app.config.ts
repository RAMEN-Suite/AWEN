import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, withComponentInputBinding, withNavigationErrorHandler } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EntityService } from './entity.service';
import { LocalStoreService } from './utils/local-store.service';
import { ConfigService } from './config-module/config.service';
import { HealthService } from './api/health.service';

export const appConfig: ApplicationConfig = {
  providers: [
    EntityService,
    ConfirmationService,
    MessageService,
    ConfigService,
    HealthService,
    LocalStoreService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler((error) => {
        const router = inject(Router);
        if (error.error.message) {
          console.error('Navigation error occurred:', error.error.message);
        }
        if (error.error.status) {
          router.navigate(['/error', error.error.status]);
        } else {
          router.navigate(['/error', 'unknown']);
        }
      }),
    ),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none',
        },
      },
    }),
    provideHttpClient(),
  ],
};
