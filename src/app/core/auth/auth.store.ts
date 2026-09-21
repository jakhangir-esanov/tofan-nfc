import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { AuthService } from './auth.service';
import { AuthSession } from './auth-session';
import { AuthSessionStorage } from './auth-session.storage';
import { Registration } from './registration';
import { SessionExpiredError } from './session-expired.error';
import { UserProfile } from './user-profile';
import { resolveTimeZone } from './time-zone';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authSessionStorage = inject(AuthSessionStorage);

  private readonly user = signal<UserProfile | null>(this.readStoredUser());
  private readonly profileSaved = signal(true);
  private pendingRenewal: Promise<AuthSession> | null = null;
  private isSigningOut = false;

  readonly currentUser = this.user.asReadonly();
  readonly displayName = computed(() => this.user()?.fullName ?? '');
  readonly hasProfile = this.profileSaved.asReadonly();

  hasSession(now: Date = new Date()): boolean {
    return this.authSessionStorage.get()?.isUsable(now) ?? false;
  }

  async login(username: string, password: string): Promise<void> {
    const session = await this.authService.login(username, password);
    this.keep(session);
  }

  async register(registration: Registration): Promise<void> {
    const session = await this.authService.register(registration);
    this.keep(session);
    this.profileSaved.set(await this.saveProfile(registration));
  }

  private async saveProfile(registration: Registration): Promise<boolean> {
    try {
      await this.authService.createProfile(registration, resolveTimeZone());
      return true;
    } catch {
      return this.hasStoredProfile();
    }
  }

  private async hasStoredProfile(): Promise<boolean> {
    try {
      return (await this.authService.findProfile()) !== null;
    } catch {
      return false;
    }
  }

  renewSession(): Promise<AuthSession> {
    this.pendingRenewal ??= this.renew().finally(() => (this.pendingRenewal = null));
    return this.pendingRenewal;
  }

  async logout(): Promise<void> {
    if (this.isSigningOut) {
      return;
    }
    this.isSigningOut = true;
    try {
      await this.forgetSession();
      this.user.set(null);
      await this.router.navigateByUrl(AppPaths.home);
    } finally {
      this.isSigningOut = false;
    }
  }

  private keep(session: AuthSession): void {
    this.authSessionStorage.save(session);
    this.user.set(this.authService.readProfile(session));
  }

  private readStoredUser(): UserProfile | null {
    const session = this.authSessionStorage.get();
    return session === null ? null : this.authService.readProfile(session);
  }

  private async renew(): Promise<AuthSession> {
    const session = this.authSessionStorage.get();
    if (session === null || !session.canBeRenewed()) {
      throw new SessionExpiredError();
    }

    try {
      const renewed = await this.authService.renew(session);
      this.authSessionStorage.save(renewed);
      return renewed;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        this.authSessionStorage.clear();
      }
      throw error;
    }
  }

  private async forgetSession(): Promise<void> {
    const session = this.authSessionStorage.get();
    if (session !== null) {
      await this.authService.revoke(session).catch(signOutLocallyAnyway);
    }
    this.authSessionStorage.clear();
  }
}

function signOutLocallyAnyway(): void {
  return;
}
