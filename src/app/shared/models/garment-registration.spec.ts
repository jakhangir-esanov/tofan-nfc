import { describe, expect, it } from 'vitest';
import { GarmentRegistration, publicStatusOf } from './garment-registration';

const registration: GarmentRegistration = {
  username: 'jahongir',
  registeredAt: new Date('2026-09-21T10:12:00Z'),
  expiresAt: new Date('2026-11-21T10:12:00Z'),
  isExpired: false,
};

describe('publicStatusOf', () => {
  it('should be unregistered when nobody claimed the shirt', () => {
    expect(publicStatusOf(null)).toBe('unregistered');
  });

  it('should be registered when the owner is still within the validity', () => {
    expect(publicStatusOf(registration)).toBe('registered');
  });

  it('should take the expiry from the server verdict, not from the dates', () => {
    expect(publicStatusOf({ ...registration, isExpired: true })).toBe('expired');
  });
});
