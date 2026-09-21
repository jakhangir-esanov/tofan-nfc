import { Injectable, inject, signal } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { Registration } from '@core/auth/registration';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class AuthFormStore {
  private readonly auth = inject(AuthStore);
  private readonly notifications = inject(NotificationService);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  login(username: string, password: string): Promise<boolean> {
    return this.run(() => this.auth.login(username, password));
  }

  async register(registration: Registration): Promise<boolean> {
    const registered = await this.run(() => this.auth.register(registration));
    if (registered && !this.auth.hasProfile()) {
      this.notifications.warn(
        $localize`:@@auth.register.profileIncomplete:Akkaunt yaratildi, lekin ismingiz saqlanmadi. Keyinroq ilovada to'ldirasiz.`,
      );
    }
    return registered;
  }

  private async run(action: () => Promise<void>): Promise<boolean> {
    this.submitting.set(true);
    this.submitError.set(null);
    try {
      await action();
      return true;
    } catch (error) {
      this.submitError.set(toErrorMessage(error));
      return false;
    } finally {
      this.submitting.set(false);
    }
  }
}
