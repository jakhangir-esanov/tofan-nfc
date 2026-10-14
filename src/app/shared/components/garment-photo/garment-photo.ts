import { Component, computed, input, linkedSignal } from '@angular/core';
import { Garment } from '@shared/garment/garment';
import { GarmentShirt } from '../garment-shirt/garment-shirt';

@Component({
  selector: 'app-garment-photo',
  imports: [GarmentShirt],
  templateUrl: './garment-photo.html',
  styleUrl: './garment-photo.css',
})
export class GarmentPhoto {
  readonly garment = input.required<Garment>();

  protected readonly imageFailed = linkedSignal({
    source: () => this.garment().imageUrl,
    computation: () => false,
  });
  protected readonly imageUrl = computed(() =>
    this.imageFailed() ? null : this.garment().imageUrl,
  );
}
