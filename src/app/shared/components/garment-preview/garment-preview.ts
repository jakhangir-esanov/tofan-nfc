import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Garment } from '@shared/models/garment';
import { GarmentColor, isHexColor } from '@shared/models/garment-color';
import { GarmentShirt } from '../garment-shirt/garment-shirt';

const COLOR_LABELS: Record<GarmentColor, string> = {
  black: $localize`:@@garment.color.black:Qora`,
  blue: $localize`:@@garment.color.blue:Ko'k`,
};

@Component({
  selector: 'app-garment-preview',
  imports: [DatePipe, GarmentShirt],
  templateUrl: './garment-preview.html',
  styleUrl: './garment-preview.css',
})
export class GarmentPreview {
  readonly garment = input.required<Garment>();

  protected readonly colorLabel = computed(() => {
    const garment = this.garment();
    if (garment.knownColor !== null) {
      return COLOR_LABELS[garment.knownColor];
    }
    return isHexColor(garment.color) ? '' : garment.color;
  });
  protected readonly hasColor = computed(() => this.garment().color.trim().length > 0);
}
