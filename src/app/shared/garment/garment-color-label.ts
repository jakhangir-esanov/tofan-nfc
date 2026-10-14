import { Garment } from './garment';
import { GarmentColor, isHexColor } from './garment-color';

const COLOR_LABELS: Record<GarmentColor, string> = {
  black: $localize`:@@garment.color.black:Qora`,
  blue: $localize`:@@garment.color.blue:Ko'k`,
};

export function colorLabelOf(garment: Garment): string {
  if (garment.knownColor !== null) {
    return COLOR_LABELS[garment.knownColor];
  }
  return isHexColor(garment.color) ? '' : garment.color;
}

export function hasColor(garment: Garment): boolean {
  return garment.color.trim().length > 0;
}
