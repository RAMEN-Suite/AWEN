import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageKey, LanguageOptions } from './models/config/LanguageOptions';
import { LocalStoreService } from './utils/local-store.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translocoService: TranslocoService =
    inject(TranslocoService);
  private readonly storageService: LocalStoreService =
    inject(LocalStoreService);
  private readonly activeLanguageState: WritableSignal<
    LanguageKey | undefined
  > = signal(undefined);

  public readonly activeLanguage: Signal<LanguageKey | undefined> =
    this.activeLanguageState.asReadonly();

  public init(): void {
    // TODO: set server
    const options: LanguageOptions = {
      initial: 'en',
      available: ['de', 'en'],
    };
    const current: LanguageKey =
      this.getStored(options.available) ??
      this.getBrowser(options.available) ??
      options.initial;

    this.translocoService.setAvailableLangs(options.available);
    this.translocoService.setDefaultLang(options.initial);
    this.setActiveLanguage(current);
  }

  public setActiveLanguage(language: LanguageKey): void {
    this.translocoService.setActiveLang(language);
    this.activeLanguageState.set(language);
    this.storageService.saveData('EM_LANGUAGE_STORE_KEY', language);
  }

  private getStored(available: LanguageKey[]): LanguageKey | null {
    const stored: string | null = this.storageService.getData(
      'EM_LANGUAGE_STORE_KEY',
    );
    return this.isAvailableLanguage(stored, available) ? stored : null;
  }

  private getBrowser(available: LanguageKey[]): LanguageKey | null {
    const languages: readonly string[] = navigator.languages.length
      ? navigator.languages
      : [navigator.language];

    for (const language of languages) {
      const key: string | undefined = language.toLowerCase().split('-').at(0);
      if (this.isAvailableLanguage(key, available)) return key;
    }

    return null;
  }

  private isAvailableLanguage(
    language: unknown,
    available: LanguageKey[],
  ): language is LanguageKey {
    return (
      typeof language === 'string' &&
      available.includes(language as LanguageKey)
    );
  }
}
