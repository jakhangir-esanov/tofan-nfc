import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ScanStore } from './scan.store';
import { GarmentsService } from './services/garments.service';
import { GarmentScan } from './models/garment-scan';

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

function createStore(service: Partial<GarmentsService>): ScanStore {
  TestBed.configureTestingModule({
    providers: [ScanStore, { provide: GarmentsService, useValue: service }],
  });
  return TestBed.inject(ScanStore);
}

describe('ScanStore', () => {
  it('should expose the state the server returned when the scan succeeds', async () => {
    const scan: GarmentScan = { state: 'foreign', garment };
    const store = createStore({ scan: () => Promise.resolve(scan) });

    await store.load('token-1');

    expect(store.state()).toBe('foreign');
    expect(store.garment()).toBe(garment);
    expect(store.loadError()).toBeNull();
  });

  it('should refuse to claim when the server did not say the garment is claimable', async () => {
    const claim = vi.fn();
    const store = createStore({
      scan: () => Promise.resolve({ state: 'foreign', garment }),
      claim,
    });

    await store.load('token-1');

    expect(store.claimable()).toBe(false);
    expect(store.claimableGarment()).toBeNull();
    expect(claim).not.toHaveBeenCalled();
  });

  it('should start in the loading state so a failure never renders as an empty screen', () => {
    const store = createStore({
      scan: () => Promise.resolve({ state: 'invalid', reason: 'revoked' }),
    });

    expect(store.loading()).toBe(true);
    expect(store.loadError()).toBeNull();
  });

  it('should hold no garment when the token is invalid', async () => {
    const store = createStore({
      scan: () => Promise.resolve({ state: 'invalid', reason: 'revoked' }),
    });

    await store.load('token-1');

    expect(store.state()).toBe('invalid');
    expect(store.garment()).toBeNull();
    expect(store.invalidReason()).toBe('revoked');
  });

  it('should hold no invalid reason when the scan resolved to a garment', async () => {
    const store = createStore({ scan: () => Promise.resolve({ state: 'foreign', garment }) });

    await store.load('token-1');

    expect(store.invalidReason()).toBeNull();
  });

  it('should clear the scan and report the error when the request fails', async () => {
    const store = createStore({
      scan: () => Promise.reject(new NotFoundError('missing', 'Garment.NotFound')),
    });

    await store.load('token-1');

    expect(store.state()).toBeNull();
    expect(store.loadError()).not.toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('should reload the scan from the server when a claim fails', async () => {
    const scan = vi.fn().mockResolvedValue({ state: 'foreign', garment });
    const claim = vi.fn().mockRejectedValue(new NotFoundError('taken', 'Garment.AlreadyClaimed'));
    const store = createStore({ scan, claim });

    const claimed = await store.claim('token-1');

    expect(claimed).toBe(false);
    expect(store.claimError()).not.toBeNull();
    expect(scan).toHaveBeenCalledWith('token-1');
    expect(store.state()).toBe('foreign');
  });

  it('should expose the state returned by the claim when it succeeds', async () => {
    const store = createStore({
      scan: () => Promise.resolve({ state: 'claimable', garment }),
      claim: () => Promise.resolve({ state: 'owned', garment }),
    });

    const claimed = await store.claim('token-1');

    expect(claimed).toBe(true);
    expect(store.state()).toBe('owned');
  });
});
