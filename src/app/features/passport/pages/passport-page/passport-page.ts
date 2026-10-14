import {
  Component,
  LOCALE_ID,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { toAppLocale } from '@core/layout/models/app-locale';
import { Logo } from '@shared/components/logo/logo';
import { PassportBook } from '../../components/passport-book/passport-book';
import { StateScreen } from '@shared/components/state-screen/state-screen';
import { PassportCard } from '../../components/passport-card/passport-card';
import { PassportProfile } from '../../components/passport-profile/passport-profile';
import { PassportShirt } from '../../components/passport-shirt/passport-shirt';
import { PassportTabs } from '../../components/passport-tabs/passport-tabs';
import { PassportStore } from '../../passport.store';
import { holderName, levelName } from '../../models/passport';
import { PASSPORT_TAB_OPTIONS, PassportTab } from '../../models/passport-tab';

@Component({
  selector: 'app-passport-page',
  imports: [
    Logo,
    PassportBook,
    PassportCard,
    PassportProfile,
    PassportShirt,
    PassportTabs,
    StateScreen,
  ],
  providers: [PassportStore],
  templateUrl: './passport-page.html',
  styleUrl: './passport-page.css',
})
export class PassportPage {
  private readonly router = inject(Router);

  readonly token = input.required<string>();

  private readonly locale = toAppLocale(inject(LOCALE_ID));

  protected readonly store = inject(PassportStore);
  protected readonly tabOptions = PASSPORT_TAB_OPTIONS;
  protected readonly tab = signal<PassportTab>('card');
  protected readonly opened = signal(false);
  protected readonly openedAt = new Date();
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
