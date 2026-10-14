import { describe, expect, it } from 'vitest';
import { validityOf } from './validity';

const activatedAt = new Date('2026-10-01T00:00:00Z');
const expiresAt = new Date('2026-12-01T00:00:00Z');

describe('validityOf', () => {
  it('should count the whole days left when the passport is still running', () => {
    const validity = validityOf(activatedAt, expiresAt, new Date('2026-10-12T00:00:00Z'));

    expect(validity.daysLeft).toBe(50);
    expect(validity.elapsedShare).toBeCloseTo(11 / 61);
  });

  it('should round a started day up when less than a day is left', () => {
    const validity = validityOf(activatedAt, expiresAt, new Date('2026-11-30T18:00:00Z'));

    expect(validity.daysLeft).toBe(1);
  });

  it('should show no days and a full bar when the expiry date has passed', () => {
    const validity = validityOf(activatedAt, expiresAt, new Date('2027-01-05T00:00:00Z'));

    expect(validity).toEqual({ daysLeft: 0, elapsedShare: 1 });
  });

  it('should show an empty bar when the device clock is before the activation', () => {
    const validity = validityOf(activatedAt, expiresAt, new Date('2026-09-01T00:00:00Z'));

    expect(validity.elapsedShare).toBe(0);
  });

  it('should show a full bar when the dates leave no period at all', () => {
    const validity = validityOf(expiresAt, expiresAt, new Date('2026-10-12T00:00:00Z'));

    expect(validity.elapsedShare).toBe(1);
  });
});
