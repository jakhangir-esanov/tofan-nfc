import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Garment } from '@shared/models/garment';

@Component({
  selector: 'app-garment-preview',
  imports: [DatePipe],
  templateUrl: './garment-preview.html',
  styleUrl: './garment-preview.css',
})
export class GarmentPreview {
  readonly garment = input.required<Garment>();

  protected readonly photoUrl = computed(() => this.garment().photoUrls[0] ?? null);
}
