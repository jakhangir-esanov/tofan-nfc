import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { GarmentPreview } from '@shared/components/garment-preview/garment-preview';
import { GarmentRegistration } from '@shared/garment/garment-registration';
import { Passport } from '../../models/passport';
import { validityOf } from '../../models/validity';

const WHOLE_BAR = 100;

@Component({
  selector: 'app-passport-shirt',
  imports: [DatePipe, GarmentPreview],
  templateUrl: './passport-shirt.html',
  styleUrl: './passport-shirt.css',
})
export class PassportShirt {
  readonly passport = input.required<Passport>();
  readonly now = input.required<Date>();

  protected readonly registration = computed<GarmentRegistration>(() => ({
    username: null,
    registeredAt: this.passport().activatedAt,
    expiresAt: this.passport().expiresAt,
    isExpired: this.passport().isExpired,
  }));
  protected readonly validity = computed(() =>
    validityOf(this.passport().activatedAt, this.passport().expiresAt, this.now()),
  );
  protected readonly barWidth = computed(() =>
    this.passport().isExpired ? WHOLE_BAR : this.validity().elapsedShare * WHOLE_BAR,
  );
}
