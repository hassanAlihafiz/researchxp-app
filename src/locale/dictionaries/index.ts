import type { AppLanguage, MessageBranch } from '../types';
import { ar } from './ar';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { hi } from './hi';
import { it } from './it';
import { ja } from './ja';
import { ko } from './ko';
import { pt } from './pt';
import { tr } from './tr';
import { zh } from './zh';

export const messageTrees: Record<AppLanguage, MessageBranch> = {
  en,
  es,
  fr,
  de,
  pt,
  zh,
  ar,
  ja,
  ko,
  tr,
  it,
  hi,
};
