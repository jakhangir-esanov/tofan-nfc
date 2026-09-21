import { Component, inject, input, signal } from '@angular/core';
import { FormField, form, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { AppPaths } from '@core/config/app-paths';
import { safeReturnUrl } from '@core/auth/return-url';
import { AuthFormStore } from '../../auth-form.store';
import { MINIMUM_PASSWORD_LENGTH } from '../../models/credentials-rules';

interface LoginFormValue {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-page',
  imports: [ButtonModule, FormField, InputTextModule, RouterLink],
  providers: [AuthFormStore],
  templateUrl: './login-page.html',
  styleUrl: '../../auth-form.css',
})
export class LoginPage {
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();

  protected readonly store = inject(AuthFormStore);
  protected readonly value = signal<LoginFormValue>({ username: '', password: '' });
  protected readonly loginForm = form(this.value, (path) => {
    required(path.username);
    required(path.password);
    minLength(path.password, MINIMUM_PASSWORD_LENGTH);
  });

  protected async submit(): Promise<void> {
    if (this.loginForm().invalid()) {
      return;
    }

    const { username, password } = this.value();
    if (await this.store.login(username, password)) {
      await this.router.navigateByUrl(safeReturnUrl(this.returnUrl() ?? null));
    }
  }

  protected registerLink(): string {
    return AppPaths.register;
  }
}
