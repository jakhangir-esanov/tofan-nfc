import { describe, expect, it } from 'vitest';
import { NEUTRAL_SHADE, garmentShadeOf, isHexColor, toGarmentColor } from './garment-color';

describe('toGarmentColor', () => {
  it('should recognise the catalogue code when an older shirt stored it', () => {
    expect(toGarmentColor('black')).toBe('black');
    expect(toGarmentColor('blue')).toBe('blue');
  });

  it('should recognise the Uzbek name when an older shirt stored it', () => {
    expect(toGarmentColor(' Qora ')).toBe('black');
    expect(toGarmentColor("Ko'k")).toBe('blue');
    expect(toGarmentColor('Ko‘k')).toBe('blue');
  });

  it('should return null when the colour is a code or not in the catalogue', () => {
    expect(toGarmentColor('#1A3C6E')).toBeNull();
    expect(toGarmentColor('Qizil')).toBeNull();
    expect(toGarmentColor('')).toBeNull();
  });
});

describe('isHexColor', () => {
  it('should accept the code when the admin panel saved #RRGGBB', () => {
    expect(isHexColor('#1A3C6E')).toBe(true);
    expect(isHexColor(' #1a3c6e ')).toBe(true);
  });

  it('should reject the value when it is a word or a short code', () => {
    expect(isHexColor('black')).toBe(false);
    expect(isHexColor('#1A3')).toBe(false);
  });
});

describe('garmentShadeOf', () => {
  it('should paint the shirt with the code when the admin panel saved one', () => {
    expect(garmentShadeOf(' #1a3c6e ')).toBe('#1A3C6E');
  });

  it('should use the catalogue shade when an older shirt stored a colour name', () => {
    expect(garmentShadeOf('Qora')).toBe('var(--app-shirt-black)');
    expect(garmentShadeOf('blue')).toBe('var(--app-shirt-blue)');
  });

  it('should fall back to the neutral shade when the colour is unknown', () => {
    expect(garmentShadeOf('Qizil')).toBe(NEUTRAL_SHADE);
    expect(garmentShadeOf('')).toBe(NEUTRAL_SHADE);
  });
});
