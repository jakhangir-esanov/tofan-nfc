export interface GarmentRegistration {
  readonly username: string | null;
  readonly registeredAt: Date;
  readonly expiresAt: Date;
  readonly isExpired: boolean;
}

export type GarmentPublicStatus = 'unregistered' | 'registered' | 'expired';

export function publicStatusOf(registration: GarmentRegistration | null): GarmentPublicStatus {
  if (registration === null) {
    return 'unregistered';
  }
  return registration.isExpired ? 'expired' : 'registered';
}
