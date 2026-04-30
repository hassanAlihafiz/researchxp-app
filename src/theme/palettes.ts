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

/**
 * Pulse brand palette (Guidelines — Mark E): navy #001028, royal #005BED, cyan #00AEEF,
 * alt surface #F1F2F2, gradient accent #6B5FED → #00AEEF.
 */
export const darkPalette: AppPalette = {
  background: '#001028',
  backgroundElevated: '#061A35',
  surface: '#0c2340',
  text: '#f1f5f9',
  textSecondary: '#a8b8cc',
  textMuted: '#7d8fa6',
  border: '#1a3352',
  primary: '#00AEEF',
  onPrimary: '#001028',
  inputBackground: '#0c2340',
  inputBorder: '#2a4a6f',
  placeholder: '#7d8fa6',
  tabBar: '#061A35',
  tabBarBorder: '#1a3352',
  drawerBackground: '#061A35',
  buttonSecondary: '#0c2340',
  buttonSecondaryBorder: '#2a4a6f',
  buttonSecondaryText: '#f1f5f9',
  label: '#c5d4e4',
  chipSelectedBackground: 'rgba(0, 174, 239, 0.16)',
};

export const lightPalette: AppPalette = {
  background: '#F1F2F2',
  backgroundElevated: '#ffffff',
  surface: '#ffffff',
  text: '#001028',
  textSecondary: '#334155',
  textMuted: '#64748b',
  border: '#e2e4e6',
  primary: '#005BED',
  onPrimary: '#ffffff',
  inputBackground: '#ffffff',
  inputBorder: '#cfd4d8',
  placeholder: '#94a3b8',
  tabBar: '#ffffff',
  tabBarBorder: '#e2e4e6',
  drawerBackground: '#ffffff',
  buttonSecondary: '#e8eaed',
  buttonSecondaryBorder: '#cfd4d8',
  buttonSecondaryText: '#001028',
  label: '#475569',
  chipSelectedBackground: 'rgba(0, 91, 237, 0.12)',
};

export function paletteForScheme(scheme: ColorScheme): AppPalette {
  return scheme === 'dark' ? darkPalette : lightPalette;
}
