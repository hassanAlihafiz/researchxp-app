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
 * Brand colors from ResearchXP logo (orange gradient mark + wordmark).
 * Primary ~#FF7F00, deep accent ~#E63900; neutrals skew warm to match the mark.
 */
export const darkPalette: AppPalette = {
  background: '#0f0e0d',
  backgroundElevated: '#161412',
  surface: '#1c1a17',
  text: '#f7f4f0',
  textSecondary: '#b8b0a8',
  textMuted: '#8a8480',
  border: '#2e2a26',
  primary: '#ff8a1a',
  onPrimary: '#ffffff',
  inputBackground: '#1c1a17',
  inputBorder: '#3d3833',
  placeholder: '#7a726b',
  tabBar: '#161412',
  tabBarBorder: '#2e2a26',
  drawerBackground: '#161412',
  buttonSecondary: '#262320',
  buttonSecondaryBorder: '#3d3833',
  buttonSecondaryText: '#f7f4f0',
  label: '#d4cec6',
  chipSelectedBackground: 'rgba(255, 138, 26, 0.18)',
};

export const lightPalette: AppPalette = {
  background: '#faf8f5',
  backgroundElevated: '#ffffff',
  surface: '#ffffff',
  text: '#1a1612',
  textSecondary: '#5c554d',
  textMuted: '#8a8178',
  border: '#e8e4de',
  primary: '#ff7f00',
  onPrimary: '#ffffff',
  inputBackground: '#ffffff',
  inputBorder: '#d9d4cd',
  placeholder: '#a39a91',
  tabBar: '#ffffff',
  tabBarBorder: '#e8e4de',
  drawerBackground: '#ffffff',
  buttonSecondary: '#f3efea',
  buttonSecondaryBorder: '#d9d4cd',
  buttonSecondaryText: '#1a1612',
  label: '#4a4540',
  chipSelectedBackground: 'rgba(255, 127, 0, 0.14)',
};

export function paletteForScheme(scheme: ColorScheme): AppPalette {
  return scheme === 'dark' ? darkPalette : lightPalette;
}
