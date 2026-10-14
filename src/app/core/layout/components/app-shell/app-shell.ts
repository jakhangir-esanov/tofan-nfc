import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastModule } from '@openng/optimus-ui/toast';
import { AuthStore } from '@core/auth/auth.store';
import { AppPaths } from '@core/config/app-paths';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';
import { Logo } from '@shared/components/logo/logo';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterOutlet, ToastModule, LanguageSwitcher, ThemeSwitcher, Logo],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  private readonly auth = inject(AuthStore);

  protected readonly home = AppPaths.home;
  protected readonly signedIn = computed(() => this.auth.currentUser() !== null);

  protected signOut(): void {
    void this.auth.logout();
  }
}
