import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DefaultTheme, type Theme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type AppPalette,
  type ColorScheme,
  paletteForScheme,
} from './palettes';

const STORAGE_KEY = '@researchxp/color_scheme';

type ThemeContextValue = {
  colorScheme: ColorScheme;
  colors: AppPalette;
  navigationTheme: Theme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function buildNavigationTheme(palette: AppPalette, dark: boolean): Theme {
  return {
    ...DefaultTheme,
    dark,
    colors: {
      ...DefaultTheme.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.backgroundElevated,
      text: palette.text,
      border: palette.border,
      notification: palette.primary,
    },
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('dark');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (
          !cancelled &&
          (stored === 'light' || stored === 'dark')
        ) {
          setColorSchemeState(stored);
        }
      } catch {
        /* keep default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    AsyncStorage.setItem(STORAGE_KEY, scheme).catch(() => {});
  }, []);

  const toggleColorScheme = useCallback(() => {
    setColorSchemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = useMemo(
    () => paletteForScheme(colorScheme),
    [colorScheme],
  );

  const navigationTheme = useMemo(
    () => buildNavigationTheme(colors, colorScheme === 'dark'),
    [colors, colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      colors,
      navigationTheme,
      setColorScheme,
      toggleColorScheme,
    }),
    [
      colorScheme,
      colors,
      navigationTheme,
      setColorScheme,
      toggleColorScheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return ctx;
}
