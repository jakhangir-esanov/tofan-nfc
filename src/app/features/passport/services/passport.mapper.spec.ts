import { describe, expect, it } from 'vitest';
import { PassportDto, StampKindDto } from './passport.dto';
import { toPassport } from './passport.mapper';

const dto: PassportDto = {
  garment: {
    serialNumber: 'PT-2026-000123',
    model: 'Peaktofan Classic',
    color: 'Qora',
    size: 'L',
    material: '95% paxta',
    manufacturedAt: '2026-08-14T00:00:00Z',
    photoUrls: [],
  },
  owner: { firstName: 'Jahongir', lastName: 'Esanov' },
  activatedAt: '2026-09-21T10:12:00Z',
  expiresAt: '2026-11-21T10:12:00Z',
  isExpired: false,
  rating: 1280,
  stamps: [
    {
      id: 'stamp-1',
      code: 'pr-bench-100',
      title: 'Bench press 100 kg',
      iconUrl: null,
      kind: StampKindDto.PersonalRecord,
      awardedAt: '2026-09-19T08:00:00Z',
    },
  ],
};

describe('toPassport', () => {
  it('should map the holder and the dates when the passport is valid', () => {
    const passport = toPassport(dto);

    expect(passport.holder).toEqual({ firstName: 'Jahongir', lastName: 'Esanov' });
    expect(passport.activatedAt).toEqual(new Date('2026-09-21T10:12:00Z'));
    expect(passport.expiresAt).toEqual(new Date('2026-11-21T10:12:00Z'));
  });

  it('should take the expiry verdict from the server flag, not from the dates', () => {
    const expired = toPassport({ ...dto, isExpired: true, rating: null, stamps: [] });

    expect(expired.isExpired).toBe(true);
    expect(expired.rating).toBeNull();
    expect(expired.stamps).toEqual([]);
  });

  it('should map every stamp kind by name', () => {
    const kinds = [
      [StampKindDto.PersonalRecord, 'personalRecord'],
      [StampKindDto.Achievement, 'achievement'],
      [StampKindDto.Rank, 'rank'],
      [StampKindDto.Special, 'special'],
    ] as const;

    for (const [apiKind, expected] of kinds) {
      const mapped = toPassport({
        ...dto,
        stamps: [{ ...dto.stamps[0], kind: apiKind }],
      });
      expect(mapped.stamps[0].kind).toBe(expected);
    }
  });

  it('should fail when the backend sends an unknown stamp kind', () => {
    const unknown = { ...dto, stamps: [{ ...dto.stamps[0], kind: 99 as StampKindDto }] };

    expect(() => toPassport(unknown)).toThrowError(/unknown enum value/);
  });
});
