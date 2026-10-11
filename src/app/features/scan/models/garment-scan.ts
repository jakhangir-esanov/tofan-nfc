import { Garment } from '@shared/models/garment';
import { GarmentRegistration } from '@shared/models/garment-registration';

export type InvalidReason = 'unknown' | 'revoked' | 'hidden';

export type ScanState = GarmentScan['state'];

type ValidScanState = 'unclaimed' | 'claimable' | 'owned' | 'expired' | 'foreign';

export type GarmentScan =
  | {
      readonly state: ValidScanState;
      readonly garment: Garment;
      readonly registration: GarmentRegistration | null;
    }
  | { readonly state: 'invalid'; readonly reason: InvalidReason };

export function garmentOf(scan: GarmentScan): Garment | null {
  return scan.state === 'invalid' ? null : scan.garment;
}

export function registrationOf(scan: GarmentScan): GarmentRegistration | null {
  return scan.state === 'invalid' ? null : scan.registration;
}

export function invalidReasonOf(scan: GarmentScan): InvalidReason | null {
  return scan.state === 'invalid' ? scan.reason : null;
}

export type ScanScreen = 'scan' | 'activate' | 'passport' | 'verify';

const SCREEN_BY_STATE: Readonly<Record<ScanState, ScanScreen>> = {
  unclaimed: 'scan',
  invalid: 'scan',
  claimable: 'activate',
  owned: 'passport',
  expired: 'passport',
  foreign: 'verify',
};

export function screenFor(state: ScanState): ScanScreen {
  return SCREEN_BY_STATE[state];
}

export function belongsOn(state: ScanState | null, screen: ScanScreen): boolean {
  return state === null || screenFor(state) === screen;
}
