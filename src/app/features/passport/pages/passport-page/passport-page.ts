import { DatePipe } from '@angular/common';
import { Component, afterNextRender, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { PassportBook } from '@shared/components/passport-book/passport-book';
import { StateScreen } from '@shared/components/state-screen/state-screen';
import { PassportStore } from '../../passport.store';
import { holderName } from '../../models/passport';

@Component({
  selector: 'app-passport-page',
  imports: [DatePipe, PassportBook, StateScreen],
  providers: [PassportStore],
  templateUrl: './passport-page.html',
  styleUrl: './passport-page.css',
})
export class PassportPage {
  private readonly router = inject(Router);

  readonly token = input.required<string>();

  protected readonly store = inject(PassportStore);
  protected readonly pageLabels = [
    $localize`:@@passport.page.cover:Muqova`,
    $localize`:@@passport.page.data:Ma'lumot`,
    $localize`:@@passport.page.stamps:Shtamplar`,
  ];

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
