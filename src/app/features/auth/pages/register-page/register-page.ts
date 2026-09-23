import { Component, inject, input, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  maxLength,
  minLength,
  required,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { safeReturnUrl } from '@core/auth/return-url';
import { Gender, Registration } from '@core/auth/registration';
import { AppPaths } from '@core/config/app-paths';
import { PasswordInput } from '@shared/components/password-input/password-input';
import { AuthFormStore } from '../../auth-form.store';
import { MAXIMUM_PASSWORD_LENGTH, MINIMUM_PASSWORD_LENGTH } from '../../models/credentials-rules';

interface RegisterFormValue {
  firstName: string;
  lastName: string;
  gender: Gender | '';
  email: string;
  password: string;
}

const EMPTY_FORM: RegisterFormValue = {
  firstName: '',
  lastName: '',
  gender: '',
  email: '',
  password: '',
};

@Component({
  selector: 'app-register-page',
  imports: [ButtonModule, FormField, FormRoot, InputTextModule, PasswordInput, RouterLink],
  providers: [AuthFormStore],
  templateUrl: './register-page.html',
  styleUrl: '../../auth-form.css',
})
export class RegisterPage {
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();

  protected readonly store = inject(AuthFormStore);
  protected readonly value = signal<RegisterFormValue>(EMPTY_FORM);
  protected readonly registerForm = form(
    this.value,
    (path) => {
      required(path.firstName);
      required(path.lastName);
      required(path.gender);
      required(path.email);
      email(path.email);
      required(path.password);
      minLength(path.password, MINIMUM_PASSWORD_LENGTH);
      maxLength(path.password, MAXIMUM_PASSWORD_LENGTH);
    },
    { submission: { action: () => this.register() } },
  );

  private async register(): Promise<undefined> {
    const registration = toRegistration(this.value());
    if (registration !== null && (await this.store.register(registration))) {
      await this.router.navigateByUrl(safeReturnUrl(this.returnUrl() ?? null));
    }
    return undefined;
  }

  protected loginLink(): string {
    return AppPaths.login;
  }
}

function toRegistration(value: RegisterFormValue): Registration | null {
  if (value.gender === '') {
    return null;
  }
  return {
    firstName: value.firstName,
    lastName: value.lastName,
    gender: value.gender,
    email: value.email,
    phoneNumber: null,
    password: value.password,
  };
}
