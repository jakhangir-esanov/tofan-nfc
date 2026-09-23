import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { AuthStore } from '@core/auth/auth.store';
import { Registration } from '@core/auth/registration';
import { NotificationService } from '@core/feedback/notification.service';
import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { AuthFormStore } from './auth-form.store';

const registration: Registration = {
  firstName: 'Jahongir',
  lastName: 'Esanov',
  gender: 'male',
  email: 'jahongir@example.com',
  phoneNumber: null,
  password: 'Passw0rd!23',
};

function createStore(
  auth: Partial<AuthStore>,
  notifications: Partial<NotificationService> = {},
): AuthFormStore {
  TestBed.configureTestingModule({
    providers: [
      AuthFormStore,
      { provide: AuthStore, useValue: { hasProfile: signal(true), ...auth } },
      {
        provide: NotificationService,
        useValue: { warn: vi.fn(), error: vi.fn(), ...notifications },
      },
    ],
  });
  return TestBed.inject(AuthFormStore);
}

describe('AuthFormStore', () => {
  it('should report success and clear the error when login works', async () => {
    const store = createStore({ login: () => Promise.resolve() });

    await expect(store.login('jahongir@example.com', 'Passw0rd!23')).resolves.toBe(true);
    expect(store.submitError()).toBeNull();
    expect(store.submitting()).toBe(false);
  });

  it('should show a message and stay on the form when the credentials are wrong', async () => {
    const store = createStore({ login: () => Promise.reject(new InvalidCredentialsError()) });

    await expect(store.login('jahongir@example.com', 'wrong')).resolves.toBe(false);
    expect(store.submitError()).not.toBeNull();
    expect(store.submitting()).toBe(false);
  });

  it('should warn but still continue when the profile step did not save', async () => {
    const warn = vi.fn();
    const store = createStore(
      { register: () => Promise.resolve(), hasProfile: signal(false) },
      { warn },
    );

    await expect(store.register(registration)).resolves.toBe(true);
    expect(warn).toHaveBeenCalled();
  });

  it('should stay quiet when registration saved the profile too', async () => {
    const warn = vi.fn();
    const store = createStore({ register: () => Promise.resolve() }, { warn });

    await store.register(registration);

    expect(warn).not.toHaveBeenCalled();
  });
});
