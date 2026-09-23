import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { AuthSession } from './auth-session';
import { AuthSessionStorage } from './auth-session.storage';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';
import { Registration } from './registration';
import { UserProfile } from './user-profile';

const registration: Registration = {
  firstName: 'Jahongir',
  lastName: 'Esanov',
  gender: 'male',
  email: 'jahongir@example.com',
  phoneNumber: null,
  password: 'Passw0rd!23',
};

function session(): AuthSession {
  return new AuthSession(
    'access',
    new Date(Date.now() + 3600_000),
    'refresh',
    new Date(Date.now() + 86_400_000),
  );
}

function createStore(authService: Partial<AuthService>): {
  store: AuthStore;
  storage: AuthSessionStorage;
} {
  let stored: AuthSession | null = null;
  const storage: Partial<AuthSessionStorage> = {
    get: () => stored,
    save: (value: AuthSession) => {
      stored = value;
    },
    clear: () => {
      stored = null;
    },
  };

  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: { readProfile: () => new UserProfile('u1', 'j', 'J E'), ...authService },
      },
      { provide: AuthSessionStorage, useValue: storage },
    ],
  });

  return { store: TestBed.inject(AuthStore), storage: TestBed.inject(AuthSessionStorage) };
}

describe('AuthStore', () => {
  it('should keep the session and the user when login succeeds', async () => {
    const { store, storage } = createStore({ login: () => Promise.resolve(session()) });

    await store.login('jahongir@example.com', 'Passw0rd!23');

    expect(store.hasSession()).toBe(true);
    expect(store.displayName()).toBe('J E');
    expect(storage.get()).not.toBeNull();
  });

  it('should report a complete profile when registration saved both steps', async () => {
    const createProfile = vi.fn().mockResolvedValue(undefined);
    const { store } = createStore({ register: () => Promise.resolve(session()), createProfile });

    await store.register(registration);

    expect(store.hasSession()).toBe(true);
    expect(store.hasProfile()).toBe(true);
    expect(createProfile).toHaveBeenCalled();
  });

  it('should keep the account usable when the profile step failed', async () => {
    const { store } = createStore({
      register: () => Promise.resolve(session()),
      createProfile: () => Promise.reject(new ServiceUnavailableError()),
      findProfile: () => Promise.resolve(null),
    });

    await store.register(registration);

    expect(store.hasSession()).toBe(true);
    expect(store.hasProfile()).toBe(false);
  });

  it('should treat the profile as saved when it already exists after a failed retry', async () => {
    const { store } = createStore({
      register: () => Promise.resolve(session()),
      createProfile: () => Promise.reject(new ServiceUnavailableError()),
      findProfile: () =>
        Promise.resolve({
          id: 'p1',
          userId: 'u1',
          firstName: 'Jahongir',
          lastName: 'Esanov',
          userName: 'j',
        }),
    });

    await store.register(registration);

    expect(store.hasProfile()).toBe(true);
  });

  it('should renew the session once when several requests race', async () => {
    const renew = vi.fn().mockResolvedValue(session());
    const { store, storage } = createStore({ login: () => Promise.resolve(session()), renew });
    storage.save(session());

    await Promise.all([store.renewSession(), store.renewSession(), store.renewSession()]);

    expect(renew).toHaveBeenCalledTimes(1);
  });

  it('should forget the session when the user signs out', async () => {
    const revoke = vi.fn().mockResolvedValue(undefined);
    const { store, storage } = createStore({ login: () => Promise.resolve(session()), revoke });
    storage.save(session());

    await store.logout();

    expect(storage.get()).toBeNull();
    expect(store.currentUser()).toBeNull();
  });

  it('should sign out locally when the backend cannot be reached', async () => {
    const revoke = vi.fn().mockRejectedValue(new ServiceUnavailableError());
    const { store, storage } = createStore({ login: () => Promise.resolve(session()), revoke });
    storage.save(session());

    await store.logout();

    expect(storage.get()).toBeNull();
  });
});
