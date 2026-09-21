import { Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { InMemoryStorage } from './in-memory.storage';
import { AuthSession } from './auth-session';

export const SESSION_STORAGE = new InjectionToken<Storage>('SESSION_STORAGE', {
  providedIn: 'root',
  factory: () => (isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : new InMemoryStorage()),
});

const STORAGE_KEY = 'tofan.nfc.session';

interface StoredSession {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string;
  refreshExpiresAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionStorage {
  private readonly storage = inject(SESSION_STORAGE);

  get(): AuthSession | null {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const stored = parseStoredSession(raw);
    if (stored === null) {
      this.clear();
      return null;
    }

    return new AuthSession(
      stored.accessToken,
      new Date(stored.expiresAt),
      stored.refreshToken,
      stored.refreshExpiresAt === null ? null : new Date(stored.refreshExpiresAt),
    );
  }

  save(session: AuthSession): void {
    const stored: StoredSession = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt.toISOString(),
      refreshExpiresAt: session.refreshExpiresAt?.toISOString() ?? null,
    };
    this.storage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}

function parseStoredSession(raw: string): StoredSession | null {
  try {
    const value: unknown = JSON.parse(raw);
    return isStoredSession(value) ? value : null;
  } catch {
    return null;
  }
}

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['accessToken'] === 'string' &&
    isDateString(candidate['expiresAt']) &&
    isNullOr(candidate['refreshToken'], (token) => typeof token === 'string') &&
    isNullOr(candidate['refreshExpiresAt'], isDateString)
  );
}

function isDateString(value: unknown): boolean {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isNullOr(value: unknown, isValid: (value: unknown) => boolean): boolean {
  return value === null || value === undefined || isValid(value);
}
