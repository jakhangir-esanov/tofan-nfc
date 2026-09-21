import { DOCUMENT } from '@angular/common';
import { Component, LOCALE_ID, inject } from '@angular/core';
import { AppLocale, SUPPORTED_LOCALES, localizedUrl, toAppLocale } from './app-locale';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  private readonly document = inject(DOCUMENT);

  protected readonly locales = SUPPORTED_LOCALES;
  protected readonly current = toAppLocale(inject(LOCALE_ID));

  protected switchTo(locale: AppLocale): void {
    if (locale === this.current) {
      return;
    }
    const location = this.document.location;
    location.assign(localizedUrl(location.pathname, locale) + location.search);
  }
}
