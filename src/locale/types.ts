export type AppLanguage = 'en' | 'fr' | 'es';

export const APP_LANGUAGES: AppLanguage[] = ['en', 'fr', 'es'];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export const LOCALE_STORAGE_KEY = '@researchxp/app_language';

export type MessageBranch = { readonly [key: string]: string | MessageBranch };
