import { describe, expect, it } from 'vitest';
import { GarmentScanDto, GarmentScanStateDto } from './garment-scan.dto';
import { toGarmentScan } from './garment-scan.mapper';
import { ScanContractError } from '../models/scan-contract.error';

const garmentDto = {
  serialNumber: 'PT-2026-000123',
  model: 'Peaktofan Classic',
  color: 'Qora',
  size: 'L',
  material: '95% paxta',
  manufacturedAt: '2026-08-14T00:00:00Z',
  photoUrls: ['https://cdn.test/front.jpg'],
};

describe('toGarmentScan', () => {
  it('should map every backend state by name when the state is known', () => {
    const states: [GarmentScanStateDto, string][] = [
      [GarmentScanStateDto.Unclaimed, 'unclaimed'],
      [GarmentScanStateDto.Claimable, 'claimable'],
      [GarmentScanStateDto.Owned, 'owned'],
      [GarmentScanStateDto.Expired, 'expired'],
      [GarmentScanStateDto.Foreign, 'foreign'],
    ];

    for (const [dtoState, expected] of states) {
      const scan = toGarmentScan({ state: dtoState, garment: garmentDto });
      expect(scan.state).toBe(expected);
    }
  });

  it('should carry no garment when the token is invalid', () => {
    const scan = toGarmentScan({ state: GarmentScanStateDto.Invalid, garment: null });

    expect(scan).toEqual({ state: 'invalid' });
  });

  it('should map the manufactured date to a Date when the garment is present', () => {
    const scan = toGarmentScan({ state: GarmentScanStateDto.Owned, garment: garmentDto });

    expect(scan.state === 'owned' && scan.garment.manufacturedAt).toEqual(
      new Date('2026-08-14T00:00:00Z'),
    );
  });

  it('should fail when a garment state arrives without a garment', () => {
    const dto: GarmentScanDto = { state: GarmentScanStateDto.Foreign, garment: null };

    expect(() => toGarmentScan(dto)).toThrowError(ScanContractError);
  });

  it('should fail when the backend sends an unknown state', () => {
    const dto = { state: 99, garment: garmentDto } as unknown as GarmentScanDto;

    expect(() => toGarmentScan(dto)).toThrowError(ScanContractError);
  });
});
