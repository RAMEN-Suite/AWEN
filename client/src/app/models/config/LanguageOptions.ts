export type LanguageKey = 'de' | 'en' | 'fr' | 'es' | 'it';
export const AVAILABLE_LANGUAGES: LanguageKey[] = ['de', 'en'];

export interface LanguageOptions {
  initial: LanguageKey;
  available: LanguageKey[];
}
