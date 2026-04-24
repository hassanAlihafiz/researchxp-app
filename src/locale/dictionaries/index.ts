import type { AppLanguage, MessageBranch } from '../types';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';

export const messageTrees: Record<AppLanguage, MessageBranch> = {
  en,
  fr,
  es,
};
