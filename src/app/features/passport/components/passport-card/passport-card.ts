import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { GarmentPhoto } from '@shared/components/garment-photo/garment-photo';
import { Logo } from '@shared/components/logo/logo';
import { colorLabelOf, hasColor } from '@shared/garment/garment-color-label';
import { machineReadableZone } from '../../models/machine-readable-zone';
import { Passport, holderName } from '../../models/passport';

@Component({
  selector: 'app-passport-card',
  imports: [DatePipe, GarmentPhoto, Logo],
  templateUrl: './passport-card.html',
  styleUrl: './passport-card.css',
})
export class PassportCard {
  readonly passport = input.required<Passport>();
  readonly level = input<string | null>(null);

  protected readonly holder = computed(() => holderName(this.passport().holder));
  protected readonly colorLabel = computed(() => colorLabelOf(this.passport().garment));
  protected readonly hasColor = computed(() => hasColor(this.passport().garment));
  protected readonly zone = computed(() =>
    machineReadableZone(this.passport().holder, this.passport().garment.serialNumber),
  );
}
