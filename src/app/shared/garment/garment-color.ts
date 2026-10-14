export const GARMENT_COLORS = ['black', 'blue'] as const;
export type GarmentColor = (typeof GARMENT_COLORS)[number];

const COLOR_ALIASES: Record<GarmentColor, readonly string[]> = {
  black: ['black', 'qora', 'черный', 'чёрный'],
  blue: ['blue', 'kok', 'синий'],
};

const CATALOGUE_SHADES: Record<GarmentColor, string> = {
  black: 'var(--app-shirt-black)',
  blue: 'var(--app-shirt-blue)',
};

export const NEUTRAL_SHADE = 'var(--app-shirt-neutral)';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const APOSTROPHES = /['’‘ʻʼ`]/g;

export function isHexColor(value: string): boolean {
  return HEX_COLOR.test(value.trim());
}

export function toGarmentColor(value: string): GarmentColor | null {
  const normalized = value.trim().toLowerCase().replace(APOSTROPHES, '');
  return GARMENT_COLORS.find((color) => COLOR_ALIASES[color].includes(normalized)) ?? null;
}

export function garmentShadeOf(value: string): string {
  if (isHexColor(value)) {
    return value.trim().toUpperCase();
  }
  const known = toGarmentColor(value);
  return known === null ? NEUTRAL_SHADE : CATALOGUE_SHADES[known];
}
