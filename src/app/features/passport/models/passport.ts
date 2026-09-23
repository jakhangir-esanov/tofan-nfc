import { Garment } from '@shared/models/garment';

export interface PassportHolder {
  readonly firstName: string;
  readonly lastName: string;
}

export interface Passport {
  readonly garment: Garment;
  readonly holder: PassportHolder;
  readonly activatedAt: Date;
  readonly expiresAt: Date;
  readonly isExpired: boolean;
}

export function holderName(holder: PassportHolder): string {
  return `${holder.firstName} ${holder.lastName}`.trim();
}
