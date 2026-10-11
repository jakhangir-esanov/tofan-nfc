import { describe, expect, it } from 'vitest';
import { GarmentInvalidReasonDto, GarmentScanDto, GarmentScanStateDto } from './garment-scan.dto';
import { toGarmentScan } from './garment-scan.mapper';
import { ScanContractError } from '../models/scan-contract.error';
import { GarmentScan } from '../models/garment-scan';

const imageUrlOf = (fileId: string): string => `/api/files/${fileId}/content`;

function mapScan(dto: GarmentScanDto): GarmentScan {
  return toGarmentScan(dto, imageUrlOf);
}

const garmentDto = {
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
};

describe('toGarmentScan', () => {
  it('should carry the owner registration when the shirt has an owner', () => {
    const scan = mapScan({
      state: GarmentScanStateDto.Foreign,
      reason: null,
      garment: garmentDto,
      registration: {
        username: 'jahongir',
        registeredAt: '2026-09-21T10:12:00Z',
        expiresAt: '2026-11-21T10:12:00Z',
        isExpired: false,
      },
    });

    expect(scan.state === 'invalid' ? null : scan.registration).toEqual({
      username: 'jahongir',
      registeredAt: new Date('2026-09-21T10:12:00Z'),
      expiresAt: new Date('2026-11-21T10:12:00Z'),
      isExpired: false,
    });
  });

  it('should map every backend state by name when the state is known', () => {
    const states: [GarmentScanStateDto, string][] = [
      [GarmentScanStateDto.Unclaimed, 'unclaimed'],
      [GarmentScanStateDto.Claimable, 'claimable'],
      [GarmentScanStateDto.Owned, 'owned'],
      [GarmentScanStateDto.Expired, 'expired'],
      [GarmentScanStateDto.Foreign, 'foreign'],
    ];

    for (const [dtoState, expected] of states) {
      const scan = mapScan({
        state: dtoState,
        reason: null,
        garment: garmentDto,
        registration: null,
      });
      expect(scan.state).toBe(expected);
    }
  });

  it('should map every invalid reason by name when the token is invalid', () => {
    const reasons: [GarmentInvalidReasonDto, string][] = [
      [GarmentInvalidReasonDto.Unknown, 'unknown'],
      [GarmentInvalidReasonDto.Revoked, 'revoked'],
      [GarmentInvalidReasonDto.Hidden, 'hidden'],
    ];

    for (const [reason, expected] of reasons) {
      const scan = mapScan({
        state: GarmentScanStateDto.Invalid,
        reason,
        garment: null,
        registration: null,
      });
      expect(scan).toEqual({ state: 'invalid', reason: expected });
    }
  });

  it('should map the manufactured date and the colour when the garment is present', () => {
    const scan = mapScan({
      state: GarmentScanStateDto.Owned,
      reason: null,
      garment: garmentDto,
      registration: null,
    });

    expect(scan.state === 'owned' && scan.garment.manufacturedAt).toEqual(
      new Date('2026-08-14T00:00:00Z'),
    );
    expect(scan.state === 'owned' && scan.garment.knownColor).toBe('black');
  });

  it('should fail when a garment state arrives without a garment', () => {
    const dto: GarmentScanDto = {
      state: GarmentScanStateDto.Foreign,
      reason: null,
      garment: null,
      registration: null,
    };

    expect(() => mapScan(dto)).toThrowError(ScanContractError);
  });

  it('should fail when an invalid state arrives without a reason', () => {
    const dto: GarmentScanDto = {
      state: GarmentScanStateDto.Invalid,
      reason: null,
      garment: null,
      registration: null,
    };

    expect(() => mapScan(dto)).toThrowError(ScanContractError);
  });

  it('should fail when the backend sends an unknown invalid reason', () => {
    const dto: GarmentScanDto = {
      state: GarmentScanStateDto.Invalid,
      reason: 99 as GarmentInvalidReasonDto,
      garment: null,
      registration: null,
    };

    expect(() => mapScan(dto)).toThrowError(ScanContractError);
  });

  it('should fail when the backend sends an unknown state', () => {
    const dto: GarmentScanDto = {
      state: 99 as GarmentScanStateDto,
      reason: null,
      garment: garmentDto,
      registration: null,
    };

    expect(() => mapScan(dto)).toThrowError(ScanContractError);
  });
});
