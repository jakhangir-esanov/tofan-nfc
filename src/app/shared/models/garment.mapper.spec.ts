import { describe, expect, it } from 'vitest';
import { GarmentDto } from './garment.dto';
import { toGarment } from './garment.mapper';

const dto: GarmentDto = {
  serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
  model: 'Peaktofan Classic',
  color: 'Qora',
  size: 'L',
  material: '95% paxta, 5% elastan',
  manufacturedAt: '2026-08-14T00:00:00Z',
};

describe('toGarment', () => {
  it('should carry the product fields through unchanged', () => {
    const garment = toGarment(dto);

    expect(garment.serialNumber).toBe('01K7X8M4Q9F2A6BC3DEFGHJKMN');
    expect(garment.model).toBe('Peaktofan Classic');
    expect(garment.material).toBe('95% paxta, 5% elastan');
  });

  it('should turn the manufactured date into a Date', () => {
    expect(toGarment(dto).manufacturedAt).toEqual(new Date('2026-08-14T00:00:00Z'));
  });

  it('should recognise the shirt colour when the backend sends a known colour', () => {
    expect(toGarment(dto).knownColor).toBe('black');
    expect(toGarment({ ...dto, color: 'blue' }).knownColor).toBe('blue');
  });

  it('should paint the shirt with the colour code when the admin panel saved one', () => {
    const garment = toGarment({ ...dto, color: '#1a3c6e' });

    expect(garment.shade).toBe('#1A3C6E');
    expect(garment.knownColor).toBeNull();
  });

  it('should use the catalogue shade when an older shirt stored a colour name', () => {
    expect(toGarment(dto).shade).toBe('var(--app-shirt-black)');
  });
});
