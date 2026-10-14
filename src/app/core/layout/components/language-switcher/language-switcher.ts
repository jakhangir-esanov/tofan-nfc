import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, LOCALE_ID, inject, signal } from '@angular/core';
import { AppLocale, SUPPORTED_LOCALES, localizedUrl, toAppLocale } from '../../models/app-locale';

const LOCALE_NAMES: Record<AppLocale, string> = {
  uz: "O'zbekcha",
  ru: 'Русский',
  en: 'English',
};

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
  host: {
    '(document:click)': 'closeWhenOutside($event)',
    '(keydown.escape)': 'close()',
  },
})
export class LanguageSwitcher {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly locales = SUPPORTED_LOCALES;
  protected readonly names = LOCALE_NAMES;
  protected readonly current = toAppLocale(inject(LOCALE_ID));
  protected readonly open = signal(false);

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected closeWhenOutside(event: Event): void {
    if (event.target instanceof Node && !this.host.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  protected switchTo(locale: AppLocale): void {
    this.close();
    if (locale === this.current) {
      return;
    }
    const location = this.document.location;
    location.assign(localizedUrl(location.pathname, locale) + location.search);
  }
}
