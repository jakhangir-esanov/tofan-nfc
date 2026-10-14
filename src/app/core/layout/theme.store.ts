import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import {
  AppTheme,
  DARK_THEME_CLASS,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  oppositeOf,
  toAppTheme,
} from './models/app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly document = inject(DOCUMENT);

  private readonly current = signal<AppTheme>(DEFAULT_THEME);

  readonly theme = this.current.asReadonly();

  restore(): void {
    this.apply(toAppTheme(this.readStored()));
  }

  toggle(): void {
    const next = oppositeOf(this.current());
    this.apply(next);
    this.remember(next);
  }

  private apply(theme: AppTheme): void {
    this.current.set(theme);
    this.document.documentElement.classList.toggle(DARK_THEME_CLASS, theme === 'dark');
  }

  private readStored(): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(THEME_STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private remember(theme: AppTheme): void {
    try {
      this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      return;
    }
  }
}
