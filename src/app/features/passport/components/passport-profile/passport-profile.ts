import { Component, computed, inject, input } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { LanguageSwitcher } from '@core/layout/components/language-switcher/language-switcher';

@Component({
  selector: 'app-passport-profile',
  imports: [LanguageSwitcher],
  templateUrl: './passport-profile.html',
  styleUrl: './passport-profile.css',
})
export class PassportProfile {
  private readonly auth = inject(AuthStore);

  readonly holder = input.required<string>();

  protected readonly username = computed(() => this.auth.currentUser()?.username ?? '');
  protected readonly name = computed(() => this.holder() || this.username());
  protected readonly initial = computed(() => this.name().charAt(0).toUpperCase());

  protected signOut(): void {
    void this.auth.logout();
  }
}
