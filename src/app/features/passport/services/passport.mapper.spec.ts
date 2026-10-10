import { describe, expect, it } from 'vitest';
import { PassportDto } from './passport.dto';
import { toPassport as mapPassport } from './passport.mapper';
import { Passport } from '../models/passport';

const imageUrlOf = (fileId: string): string => `/api/files/${fileId}/content`;

function toPassport(passport: PassportDto): Passport {
  return mapPassport(passport, imageUrlOf);
}

const dto: PassportDto = {
  garment: {
    serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
    dropName: 'Drop 1',
    editionNumber: 349,
    dropTotalQuantity: 500,
    variantName: 'Peaktofan Classic',
    imageFileId: 'f1',
    color: 'Qora',
    size: 'L',
    material: '95% paxta',
    manufacturedAt: '2026-08-14T00:00:00Z',
  },
  owner: { firstName: 'Jahongir', lastName: 'Esanov' },
  activatedAt: '2026-09-21T10:12:00Z',
  expiresAt: '2026-11-21T10:12:00Z',
  isExpired: false,
  standing: {
    rank: 12,
    lifetimeDp: 4820,
    level: { name: 'Warrior', nameRu: 'Воин', nameUz: 'Jangchi', badgeIcon: null },
  },
};

describe('toPassport', () => {
  it('should keep the rank, the lifetime DP and the level in every language', () => {
    expect(toPassport(dto).standing).toEqual({
      rank: 12,
      lifetimeDp: 4820,
      levelNames: { uz: 'Jangchi', ru: 'Воин', en: 'Warrior' },
    });
  });

  it('should leave the standing out when the backend could not give one', () => {
    expect(toPassport({ ...dto, standing: null }).standing).toBeNull();
    expect(
      toPassport({ ...dto, standing: { rank: null, lifetimeDp: 0, level: null } }).standing,
    ).toEqual({ rank: null, lifetimeDp: 0, levelNames: null });
  });

  it('should map the holder and the dates when the passport is valid', () => {
    const passport = toPassport(dto);

    expect(passport.holder).toEqual({ firstName: 'Jahongir', lastName: 'Esanov' });
    expect(passport.activatedAt).toEqual(new Date('2026-09-21T10:12:00Z'));
    expect(passport.expiresAt).toEqual(new Date('2026-11-21T10:12:00Z'));
  });

  it('should take the expiry verdict from the server flag, not from the dates', () => {
    const expired = toPassport({ ...dto, isExpired: true });

    expect(expired.isExpired).toBe(true);
    expect(expired.expiresAt).toEqual(new Date('2026-11-21T10:12:00Z'));
  });

  it('should keep empty holder names when the owner has no profile yet', () => {
    const passport = toPassport({ ...dto, owner: { firstName: '', lastName: '' } });

    expect(passport.holder).toEqual({ firstName: '', lastName: '' });
  });

  it('should recognise the shirt colour when the garment is mapped', () => {
    expect(toPassport(dto).garment.knownColor).toBe('black');
  });
});
