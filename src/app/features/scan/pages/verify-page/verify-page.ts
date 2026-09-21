import { Component, afterNextRender, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { GarmentPreview } from '@shared/components/garment-preview/garment-preview';
import { StateScreen } from '@shared/components/state-screen/state-screen';
import { ScanStore } from '../../scan.store';
import { belongsOn } from '../../models/garment-scan';
import { scanRoute } from '../../models/scan-route';

@Component({
  selector: 'app-verify-page',
  imports: [GarmentPreview, StateScreen],
  providers: [ScanStore],
  templateUrl: './verify-page.html',
  styleUrl: './verify-page.css',
})
export class VerifyPage {
  private readonly router = inject(Router);

  readonly token = input.required<string>();

  protected readonly store = inject(ScanStore);

  constructor() {
    afterNextRender(() => void this.resolve());
  }

  protected async resolve(): Promise<void> {
    await this.store.load(this.token());
    const state = this.store.state();
    if (state !== null && !belongsOn(state, 'verify')) {
      await this.router.navigateByUrl(scanRoute(state, this.token()));
    }
  }
}
