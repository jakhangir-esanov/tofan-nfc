import { DatePipe } from '@angular/common';
import { Component, LOCALE_ID, afterNextRender, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { toAppLocale } from '@core/layout/language/app-locale';
import { Logo } from '@shared/components/logo/logo';
import { PassportBook } from '@shared/components/passport-book/passport-book';
import { StateScreen } from '@shared/components/state-screen/state-screen';
import { PassportStore } from '../../passport.store';
import { holderName, levelName } from '../../models/passport';

const BOOK_PAGE_LABELS = [
  $localize`:@@passport.page.cover:Muqova`,
  $localize`:@@passport.page.data:Ma'lumot`,
];
const STANDING_PAGE_LABEL = $localize`:@@passport.page.standing:Reyting`;

@Component({
  selector: 'app-passport-page',
  imports: [DatePipe, Logo, PassportBook, StateScreen],
  providers: [PassportStore],
  templateUrl: './passport-page.html',
  styleUrl: './passport-page.css',
})
export class PassportPage {
  private readonly router = inject(Router);

  readonly token = input.required<string>();

  private readonly locale = toAppLocale(inject(LOCALE_ID));

  protected readonly store = inject(PassportStore);
  protected readonly pageLabels = computed(() =>
    this.store.passport()?.standing ? [...BOOK_PAGE_LABELS, STANDING_PAGE_LABEL] : BOOK_PAGE_LABELS,
  );
  protected readonly level = computed(() => {
    const standing = this.store.passport()?.standing;
    return standing ? levelName(standing, this.locale) : null;
  });

  protected readonly holder = computed(() => {
    const passport = this.store.passport();
    return passport === null ? '' : holderName(passport.holder);
  });

  constructor() {
    afterNextRender(() => void this.load());
  }

  protected async load(): Promise<void> {
    await this.store.load(this.token());
    if (this.store.rescanNeeded()) {
      await this.router.navigateByUrl(AppPaths.scan(this.token()));
    }
  }
}
