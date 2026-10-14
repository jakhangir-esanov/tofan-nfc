export const APP_THEMES = ['dark', 'light'] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_THEME: AppTheme = 'dark';
export const THEME_STORAGE_KEY = 'peaktofan.theme';
export const DARK_THEME_CLASS = 'app-dark';

export function toAppTheme(stored: string | null): AppTheme {
  return APP_THEMES.find((theme) => theme === stored) ?? DEFAULT_THEME;
}

export function oppositeOf(theme: AppTheme): AppTheme {
  return theme === 'dark' ? 'light' : 'dark';
}
