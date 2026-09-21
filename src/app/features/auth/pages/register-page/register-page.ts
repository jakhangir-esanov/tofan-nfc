import { Component, inject, input, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { safeReturnUrl } from '@core/auth/return-url';
import { Registration } from '@core/auth/registration';
import { AppPaths } from '@core/config/app-paths';
import { AuthFormStore } from '../../auth-form.store';
import { MAXIMUM_PASSWORD_LENGTH, MINIMUM_PASSWORD_LENGTH } from '../../models/credentials-rules';

interface RegisterFormValue {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const EMPTY_FORM: RegisterFormValue = { firstName: '', lastName: '', email: '', password: '' };

@Component({
  selector: 'app-register-page',
  imports: [ButtonModule, FormField, InputTextModule, RouterLink],
  providers: [AuthFormStore],
  templateUrl: './register-page.html',
  styleUrl: '../../auth-form.css',
})
export class RegisterPage {
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();

  protected readonly store = inject(AuthFormStore);
  protected readonly value = signal<RegisterFormValue>(EMPTY_FORM);
  protected readonly registerForm = form(this.value, (path) => {
    required(path.firstName);
    required(path.lastName);
    required(path.email);
    email(path.email);
    required(path.password);
    minLength(path.password, MINIMUM_PASSWORD_LENGTH);
    maxLength(path.password, MAXIMUM_PASSWORD_LENGTH);
  });

  protected async submit(): Promise<void> {
    if (this.registerForm().invalid()) {
      return;
    }

    if (await this.store.register(toRegistration(this.value()))) {
      await this.router.navigateByUrl(safeReturnUrl(this.returnUrl() ?? null));
    }
  }

  protected loginLink(): string {
    return AppPaths.login;
  }
}

function toRegistration(value: RegisterFormValue): Registration {
  return {
    firstName: value.firstName,
    lastName: value.lastName,
    email: value.email,
    phoneNumber: null,
    password: value.password,
  };
}
