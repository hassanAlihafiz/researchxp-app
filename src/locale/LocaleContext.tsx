import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { messageTrees } from './dictionaries';
import { getStringAtPath, interpolate } from './resolvePath';
import {
  APP_LANGUAGES,
  DEFAULT_LANGUAGE,
  LOCALE_STORAGE_KEY,
  type AppLanguage,
} from './types';

type LocaleContextValue = {
  language: AppLanguage;
  setLanguage: (next: AppLanguage) => void;
  /** Dot-path key, e.g. `login.title`. Falls back to English if missing. */
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isAppLanguage(value: string | null): value is AppLanguage {
  return value !== null && (APP_LANGUAGES as readonly string[]).includes(value);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
        if (!cancelled && isAppLanguage(stored)) {
          setLanguageState(stored);
        }
      } catch {
        /* keep default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((next: AppLanguage) => {
    setLanguageState(next);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, next).catch(() => {});
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const primary = getStringAtPath(messageTrees[language], key);
      const fallback = getStringAtPath(messageTrees.en, key);
      const raw = primary ?? fallback ?? key;
      return interpolate(raw, vars);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
