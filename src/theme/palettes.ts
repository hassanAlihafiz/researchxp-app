export type ColorScheme = 'light' | 'dark';

export type AppPalette = {
  background: string;
  backgroundElevated: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
  tabBar: string;
  tabBarBorder: string;
  drawerBackground: string;
  buttonSecondary: string;
  buttonSecondaryBorder: string;
  buttonSecondaryText: string;
  label: string;
  /** Selected toggle / chip background (e.g. appearance) */
  chipSelectedBackground: string;
};

export const darkPalette: AppPalette = {
  background: '#0b0f14',
  backgroundElevated: '#0b0f14',
  surface: '#121822',
  text: '#f2f4f7',
  textSecondary: '#9aa4b2',
  textMuted: '#6b7788',
  border: '#2a3441',
  primary: '#3b82f6',
  onPrimary: '#ffffff',
  inputBackground: '#121822',
  inputBorder: '#2a3441',
  placeholder: '#888888',
  tabBar: '#121822',
  tabBarBorder: '#2a3441',
  drawerBackground: '#121822',
  buttonSecondary: '#1e293b',
  buttonSecondaryBorder: '#334155',
  buttonSecondaryText: '#f2f4f7',
  label: '#c8d0dc',
  chipSelectedBackground: 'rgba(59, 130, 246, 0.15)',
};

export const lightPalette: AppPalette = {
  background: '#f8fafc',
  backgroundElevated: '#ffffff',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  border: '#e2e8f0',
  primary: '#2563eb',
  onPrimary: '#ffffff',
  inputBackground: '#ffffff',
  inputBorder: '#cbd5e1',
  placeholder: '#94a3b8',
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
  drawerBackground: '#ffffff',
  buttonSecondary: '#f1f5f9',
  buttonSecondaryBorder: '#cbd5e1',
  buttonSecondaryText: '#0f172a',
  label: '#334155',
  chipSelectedBackground: '#eff6ff',
};

export function paletteForScheme(scheme: ColorScheme): AppPalette {
  return scheme === 'dark' ? darkPalette : lightPalette;
}
