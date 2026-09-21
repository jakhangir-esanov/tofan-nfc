import { Component, afterNextRender, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { GarmentPreview } from '@shared/components/garment-preview/garment-preview';
import { StateScreen } from '@shared/components/state-screen/state-screen';
import { ScanStore } from '../../scan.store';
import { belongsOn } from '../../models/garment-scan';
import { scanRoute } from '../../models/scan-route';

@Component({
  selector: 'app-scan-page',
  imports: [GarmentPreview, RouterLink, StateScreen],
  providers: [ScanStore],
  templateUrl: './scan-page.html',
  styleUrl: './scan-page.css',
})
export class ScanPage {
  private readonly router = inject(Router);

  readonly token = input.required<string>();

  protected readonly store = inject(ScanStore);

  constructor() {
    afterNextRender(() => void this.resolve());
  }

  protected async resolve(): Promise<void> {
    const token = this.token();
    await this.store.load(token);

    const state = this.store.state();
    if (state !== null && !belongsOn(state, 'scan')) {
      await this.router.navigateByUrl(scanRoute(state, token));
    }
  }

  protected registerUrl(): string {
    return AppPaths.register;
  }

  protected loginUrl(): string {
    return AppPaths.login;
  }

  protected returnUrl(): string {
    return AppPaths.scan(this.token());
  }
}
