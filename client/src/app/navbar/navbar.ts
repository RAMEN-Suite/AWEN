import { Component, computed, inject, Signal } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { BackButtonComponent } from '../utils/back-button.component';
import { isActive, Router, RouterLink } from '@angular/router';
import { CreateEntity } from '../create-entity/create-entity';
import { Button, ButtonDirective } from 'primeng/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { Popover } from 'primeng/popover';
import { LanguageService } from '../language.service';
import {
  AVAILABLE_LANGUAGES,
  LanguageKey,
} from '../models/config/LanguageOptions';
import { ConfigService } from '../config-module/config.service';
import { Nullable } from 'primeng/ts-helpers';

@Component({
  selector: 'app-navbar',
  imports: [
    Menubar,
    BackButtonComponent,
    RouterLink,
    CreateEntity,
    ButtonDirective,
    Button,
    TranslocoDirective,
    Popover,
  ],
  templateUrl: './navbar.html',
})
export class Navbar {
  private router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private readonly config: ConfigService = inject(ConfigService);

  protected isHomeRoute = isActive('/', this.router, {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });

  protected items: MenuItem[] = [];

  protected readonly activeLanguage: Signal<LanguageKey | undefined> =
    this.languageService.activeLanguage;
  protected readonly languages: Signal<LanguageKey[]> = computed(
    (): LanguageKey[] => {
      const languages: LanguageKey[] =
        this.config.getConfig()().language.available;
      return AVAILABLE_LANGUAGES.filter((key: LanguageKey): boolean =>
        languages.includes(key),
      );
    },
  );

  protected handleOpenLanguages(popover: Popover, event: Event): void {
    popover.toggle(event);

    requestAnimationFrame((): void => {
      popover.align();
      this.resetPopoverOffset(popover);
    });
  }

  protected handleLanguageChange(
    language: LanguageKey,
    popover: Popover,
  ): void {
    popover.hide();
    this.languageService.setActiveLanguage(language);
  }

  private resetPopoverOffset(popover: Popover): void {
    const container: Nullable<HTMLElement> = popover.container;
    if (!container) return;
    container.style.top = `${container.offsetTop - window.scrollY}px`;
    container.style.left = `${container.offsetLeft + 15 - window.scrollX}px`;
  }
}
