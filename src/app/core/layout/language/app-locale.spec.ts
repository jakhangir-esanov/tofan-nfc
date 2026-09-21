import { describe, expect, it } from 'vitest';
import { localizedUrl, toAppLocale } from './app-locale';

describe('localizedUrl', () => {
  it('should add the locale prefix when the target is not the source locale', () => {
    expect(localizedUrl('/t/abc123', 'ru')).toBe('/ru/t/abc123');
  });

  it('should drop the locale prefix when the target is the source locale', () => {
    expect(localizedUrl('/ru/t/abc123', 'uz')).toBe('/t/abc123');
  });

  it('should swap the prefix when moving between translated locales', () => {
    expect(localizedUrl('/ru/t/abc123/passport', 'en')).toBe('/en/t/abc123/passport');
  });

  it('should keep the root path when the locale prefix is the whole path', () => {
    expect(localizedUrl('/en', 'uz')).toBe('/');
  });
});

describe('toAppLocale', () => {
  it('should read the language when the locale id carries a region', () => {
    expect(toAppLocale('ru-RU')).toBe('ru');
  });

  it('should fall back to the source locale when the locale is unknown', () => {
    expect(toAppLocale('de')).toBe('uz');
  });
});
