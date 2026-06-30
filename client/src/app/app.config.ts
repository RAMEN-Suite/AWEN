import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  Router,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EntityService } from './entity.service';
import { LocalStoreService } from './utils/local-store.service';
import { ConfigService } from './config-module/config.service';
import { HealthService } from './health.service';
import { definePreset } from '@primeuix/themes';

const awenTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
});

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
        preset: awenTheme,
        options: {
          darkModeSelector: 'none',
        },
      },
    }),
    provideHttpClient(),
  ],
};
