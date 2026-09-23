import { Injectable, computed, inject, signal } from '@angular/core';
import { toErrorMessage } from '@core/feedback/error-message';
import { Passport } from './models/passport';
import { needsRescan } from './models/rescan-rule';
import { PassportService } from './services/passport.service';

@Injectable()
export class PassportStore {
  private readonly passports = inject(PassportService);

  private readonly current = signal<Passport | null>(null);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly rescanNeeded = signal(false);

  readonly passport = this.current.asReadonly();
  readonly locked = computed(() => this.current()?.isExpired ?? false);

  async load(token: string): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    this.rescanNeeded.set(false);
    try {
      this.current.set(await this.passports.read(token));
    } catch (error) {
      this.current.set(null);
      this.reportFailure(error);
    } finally {
      this.loading.set(false);
    }
  }

  private reportFailure(error: unknown): void {
    if (needsRescan(error)) {
      this.rescanNeeded.set(true);
      return;
    }
    this.loadError.set(toErrorMessage(error));
  }
}
