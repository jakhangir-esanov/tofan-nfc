import { describe, expect, it } from 'vitest';
import { ScanState, belongsOn, screenFor } from './garment-scan';
import { scanRoute } from './scan-route';

const ALL_STATES: readonly ScanState[] = [
  'unclaimed',
  'claimable',
  'owned',
  'expired',
  'foreign',
  'invalid',
];

describe('screenFor', () => {
  it('should map every scan state to a screen', () => {
    for (const state of ALL_STATES) {
      expect(screenFor(state)).toBeDefined();
    }
  });

  it('should keep the visitor on the scan screen when the shirt is unclaimed or the token is dead', () => {
    expect(screenFor('unclaimed')).toBe('scan');
    expect(screenFor('invalid')).toBe('scan');
  });

  it('should send the owner to the passport whether or not the validity ran out', () => {
    expect(screenFor('owned')).toBe('passport');
    expect(screenFor('expired')).toBe('passport');
  });

  it('should send a stranger to the authenticity screen', () => {
    expect(screenFor('foreign')).toBe('verify');
  });
});

describe('belongsOn', () => {
  it('should accept an unresolved state so a page does not redirect before the server answered', () => {
    expect(belongsOn(null, 'activate')).toBe(true);
  });

  it('should reject a state that belongs on another screen', () => {
    expect(belongsOn('foreign', 'activate')).toBe(false);
    expect(belongsOn('claimable', 'activate')).toBe(true);
  });
});

describe('scanRoute', () => {
  it('should build the route of the screen the state belongs on', () => {
    expect(scanRoute('claimable', 'abc123')).toBe('/t/abc123/activate');
    expect(scanRoute('owned', 'abc123')).toBe('/t/abc123/passport');
    expect(scanRoute('foreign', 'abc123')).toBe('/t/abc123/verify');
    expect(scanRoute('invalid', 'abc123')).toBe('/t/abc123');
  });

  it('should encode a token that carries url characters', () => {
    expect(scanRoute('owned', 'a/b?c')).toBe('/t/a%2Fb%3Fc/passport');
  });
});
