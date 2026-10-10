import { AppLocale } from '@core/layout/language/app-locale';
import { Garment } from '@shared/models/garment';

export interface PassportHolder {
  readonly firstName: string;
  readonly lastName: string;
}

export type PassportLevelNames = Readonly<Record<AppLocale, string>>;

export interface PassportStanding {
  readonly rank: number | null;
  readonly lifetimeDp: number;
  readonly levelNames: PassportLevelNames | null;
}

export interface Passport {
  readonly garment: Garment;
  readonly holder: PassportHolder;
  readonly activatedAt: Date;
  readonly expiresAt: Date;
  readonly isExpired: boolean;
  readonly standing: PassportStanding | null;
}

export function holderName(holder: PassportHolder): string {
  return `${holder.firstName} ${holder.lastName}`.trim();
}

export function levelName(standing: PassportStanding, locale: AppLocale): string | null {
  return standing.levelNames === null ? null : standing.levelNames[locale];
}
