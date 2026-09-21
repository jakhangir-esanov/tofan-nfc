import { describe, expect, it } from 'vitest';
import { GarmentDto } from './garment.dto';
import { toGarment } from './garment.mapper';

const dto: GarmentDto = {
  serialNumber: 'PT-2026-000123',
  model: 'Peaktofan Classic',
  color: 'Qora',
  size: 'L',
  material: '95% paxta, 5% elastan',
  manufacturedAt: '2026-08-14T00:00:00Z',
  photoUrls: ['https://cdn.test/front.jpg', 'https://cdn.test/back.jpg'],
};

describe('toGarment', () => {
  it('should carry the product fields through unchanged', () => {
    const garment = toGarment(dto);

    expect(garment.serialNumber).toBe('PT-2026-000123');
    expect(garment.model).toBe('Peaktofan Classic');
    expect(garment.material).toBe('95% paxta, 5% elastan');
    expect(garment.photoUrls).toHaveLength(2);
  });

  it('should turn the manufactured date into a Date', () => {
    expect(toGarment(dto).manufacturedAt).toEqual(new Date('2026-08-14T00:00:00Z'));
  });

  it('should keep an empty photo list when the admin uploaded nothing', () => {
    expect(toGarment({ ...dto, photoUrls: [] }).photoUrls).toEqual([]);
  });
});
