import { Garment } from '@shared/models/garment';

export type InvalidReason = 'unknown' | 'revoked' | 'hidden';

export type ScanState = GarmentScan['state'];

export type GarmentScan =
  | { readonly state: 'unclaimed'; readonly garment: Garment }
  | { readonly state: 'claimable'; readonly garment: Garment }
  | { readonly state: 'owned'; readonly garment: Garment }
  | { readonly state: 'expired'; readonly garment: Garment }
  | { readonly state: 'foreign'; readonly garment: Garment }
  | { readonly state: 'invalid'; readonly reason: InvalidReason };

export function garmentOf(scan: GarmentScan): Garment | null {
  return scan.state === 'invalid' ? null : scan.garment;
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
