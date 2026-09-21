import { Injectable, computed, inject, signal } from '@angular/core';
import { toErrorMessage } from '@core/feedback/error-message';
import { Garment } from '@shared/models/garment';
import { GarmentScan, ScanState, garmentOf } from './models/garment-scan';
import { GarmentsService } from './services/garments.service';

@Injectable()
export class ScanStore {
  private readonly garments = inject(GarmentsService);

  private readonly scan = signal<GarmentScan | null>(null);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly claiming = signal(false);
  readonly claimError = signal<string | null>(null);

  readonly state = computed<ScanState | null>(() => this.scan()?.state ?? null);
  readonly claimable = computed(() => this.state() === 'claimable');
  readonly garment = computed<Garment | null>(() => {
    const scan = this.scan();
    return scan === null ? null : garmentOf(scan);
  });

  readonly claimableGarment = computed<Garment | null>(() =>
    this.claimable() ? this.garment() : null,
  );

  async load(token: string): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.scan.set(await this.garments.scan(token));
    } catch (error) {
      this.scan.set(null);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async claim(token: string): Promise<boolean> {
    this.claiming.set(true);
    this.claimError.set(null);
    try {
      this.scan.set(await this.garments.claim(token));
      return true;
    } catch (error) {
      this.claimError.set(toErrorMessage(error));
      await this.load(token);
      return false;
    } finally {
      this.claiming.set(false);
    }
  }
}
