import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { PassportStore } from './passport.store';
import { PassportService } from './services/passport.service';
import { Passport } from './models/passport';

const garment = {
  serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
  model: 'Peaktofan Classic',
  color: 'Qora',
  size: 'L',
  material: '95% paxta',
  manufacturedAt: new Date('2026-08-14T00:00:00Z'),
  knownColor: 'black' as const,
  shade: 'var(--app-shirt-black)',
};

const expiredPassport: Passport = {
  garment,
  holder: { firstName: 'Jahongir', lastName: 'Esanov' },
  activatedAt: new Date('2026-01-01T00:00:00Z'),
  expiresAt: new Date('2026-03-01T00:00:00Z'),
  isExpired: true,
};

function createStore(service: Partial<PassportService>): PassportStore {
  TestBed.configureTestingModule({
    providers: [PassportStore, { provide: PassportService, useValue: service }],
  });
  return TestBed.inject(PassportStore);
}

describe('PassportStore', () => {
  it('should lock the passport when the server marked it expired', async () => {
    const store = createStore({ read: () => Promise.resolve(expiredPassport) });

    await store.load('token-1');

    expect(store.locked()).toBe(true);
  });

  it('should keep the passport unlocked when the server did not mark it expired', async () => {
    const store = createStore({
      read: () => Promise.resolve({ ...expiredPassport, isExpired: false }),
    });

    await store.load('token-1');

    expect(store.locked()).toBe(false);
  });

  it('should ask for a rescan when the caller is not the owner', async () => {
    const store = createStore({
      read: () => Promise.reject(new BusinessRuleError('not owner', 'Garment.NotOwner')),
    });

    await store.load('token-1');

    expect(store.rescanNeeded()).toBe(true);
    expect(store.passport()).toBeNull();
  });

  it('should show no error text when the page is about to go back to the scan', async () => {
    const store = createStore({
      read: () => Promise.reject(new BusinessRuleError('not owner', 'Garment.NotOwner')),
    });

    await store.load('token-1');

    expect(store.loadError()).toBeNull();
  });

  it('should ask for a rescan when the shirt was hidden or revoked', async () => {
    const store = createStore({
      read: () => Promise.reject(new ConflictError('gone', 'Garment.NotAvailable')),
    });

    await store.load('token-1');

    expect(store.rescanNeeded()).toBe(true);
  });

  it('should not ask for a rescan when the request failed for a network reason', async () => {
    const store = createStore({ read: () => Promise.reject(new ServiceUnavailableError()) });

    await store.load('token-1');

    expect(store.rescanNeeded()).toBe(false);
    expect(store.loadError()).not.toBeNull();
  });
});
