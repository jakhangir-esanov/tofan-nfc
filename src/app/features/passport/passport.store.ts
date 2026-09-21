import { Injectable, computed, inject, signal } from '@angular/core';
import { toErrorMessage } from '@core/feedback/error-message';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { Passport } from './models/passport';
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
  readonly stamps = computed(() => this.current()?.stamps ?? []);

  async load(token: string): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    this.rescanNeeded.set(false);
    try {
      this.current.set(await this.passports.read(token));
    } catch (error) {
      this.current.set(null);
      this.rescanNeeded.set(isStaleOwnership(error));
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}

function isStaleOwnership(error: unknown): boolean {
  return error instanceof AccessDeniedError || error instanceof NotFoundError;
}
