import { Component, afterNextRender, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { AppPaths } from '@core/config/app-paths';
import { GarmentPreview } from '@shared/components/garment-preview/garment-preview';
import { StateScreen } from '@shared/components/state-screen/state-screen';
import { ScanStore } from '../../scan.store';
import { belongsOn } from '../../models/garment-scan';
import { scanRoute } from '../../models/scan-route';

@Component({
  selector: 'app-activate-page',
  imports: [ButtonModule, GarmentPreview, StateScreen],
  providers: [ScanStore],
  templateUrl: './activate-page.html',
  styleUrl: './activate-page.css',
})
export class ActivatePage {
  private readonly router = inject(Router);

  readonly token = input.required<string>();

  protected readonly store = inject(ScanStore);

  constructor() {
    afterNextRender(() => void this.resolve());
  }

  protected async resolve(): Promise<void> {
    await this.store.load(this.token());
    const state = this.store.state();
    if (state !== null && !belongsOn(state, 'activate')) {
      await this.router.navigateByUrl(scanRoute(state, this.token()));
    }
  }

  protected async activate(): Promise<void> {
    if (!this.store.claimable()) {
      return;
    }
    if (await this.store.claim(this.token())) {
      await this.router.navigateByUrl(AppPaths.passport(this.token()));
    }
  }
}
