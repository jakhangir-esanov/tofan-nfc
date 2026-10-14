import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Garment } from '@shared/garment/garment';
import { colorLabelOf, hasColor } from '@shared/garment/garment-color-label';
import {
  GarmentPublicStatus,
  GarmentRegistration,
  publicStatusOf,
} from '@shared/garment/garment-registration';
import { GarmentPhoto } from '../garment-photo/garment-photo';

const STATUS_LABELS: Record<GarmentPublicStatus, string> = {
  unregistered: $localize`:@@garment.status.unregistered:Ro'yxatdan o'tmagan`,
  registered: $localize`:@@garment.status.registered:Ro'yxatdan o'tgan`,
  expired: $localize`:@@garment.status.expired:Muddati tugagan`,
};

@Component({
  selector: 'app-garment-preview',
  imports: [DatePipe, GarmentPhoto],
  templateUrl: './garment-preview.html',
  styleUrl: './garment-preview.css',
})
export class GarmentPreview {
  readonly garment = input.required<Garment>();
  readonly registration = input<GarmentRegistration | null>(null);
  readonly compact = input(false);

  protected readonly colorLabel = computed(() => colorLabelOf(this.garment()));
  protected readonly hasColor = computed(() => hasColor(this.garment()));
  protected readonly status = computed(() => publicStatusOf(this.registration()));
  protected readonly statusLabel = computed(() => STATUS_LABELS[this.status()]);
}
