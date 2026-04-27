export type AppLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'zh'
  | 'ar'
  | 'ja'
  | 'ko'
  | 'tr'
  | 'it'
  | 'hi';

export const APP_LANGUAGES: AppLanguage[] = [
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'zh',
  'ar',
  'ja',
  'ko',
  'tr',
  'it',
  'hi',
];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export const LOCALE_STORAGE_KEY = '@researchxp/app_language';

export type MessageBranch = { readonly [key: string]: string | MessageBranch };
