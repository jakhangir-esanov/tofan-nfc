import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';
import { ActivatePage } from './pages/activate-page/activate-page';
import { ScanPage } from './pages/scan-page/scan-page';
import { VerifyPage } from './pages/verify-page/verify-page';

export const SCAN_ROUTES: Routes = [
  { path: '', component: ScanPage },
  { path: 'activate', component: ActivatePage, canActivate: [authGuard] },
  { path: 'verify', component: VerifyPage },
];
