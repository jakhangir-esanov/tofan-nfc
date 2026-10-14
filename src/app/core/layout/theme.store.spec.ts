import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from './models/app-theme';
import { ThemeStore } from './theme.store';

function rootOf(): HTMLElement {
  return TestBed.inject(DOCUMENT).documentElement;
}

describe('ThemeStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(THEME_STORAGE_KEY);
    rootOf().classList.remove('app-dark');
  });

  it('should start dark when the visitor has chosen nothing', () => {
    const store = TestBed.inject(ThemeStore);

    store.restore();

    expect(store.theme()).toBe('dark');
    expect(rootOf().classList.contains('app-dark')).toBe(true);
  });

  it('should restore the light theme when the visitor chose it before', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const store = TestBed.inject(ThemeStore);

    store.restore();

    expect(store.theme()).toBe('light');
    expect(rootOf().classList.contains('app-dark')).toBe(false);
  });

  it('should switch the page and remember the choice when toggled', () => {
    const store = TestBed.inject(ThemeStore);
    store.restore();

    store.toggle();

    expect(store.theme()).toBe('light');
    expect(rootOf().classList.contains('app-dark')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('should still switch the page when the browser refuses storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const store = TestBed.inject(ThemeStore);

    store.restore();
    store.toggle();

    expect(store.theme()).toBe('light');
  });
});
