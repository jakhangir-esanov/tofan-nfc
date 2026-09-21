export type StampKind = 'personalRecord' | 'achievement' | 'rank' | 'special';

export interface Stamp {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly iconUrl: string | null;
  readonly kind: StampKind;
  readonly awardedAt: Date;
}
