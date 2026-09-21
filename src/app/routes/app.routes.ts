import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';
import { AppShell } from '@core/layout/components/app-shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('@features/home/home.routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 't/:token/passport',
        canActivate: [authGuard],
        loadChildren: () =>
          import('@features/passport/passport.routes').then((m) => m.PASSPORT_ROUTES),
      },
      {
        path: 't/:token',
        loadChildren: () => import('@features/scan/scan.routes').then((m) => m.SCAN_ROUTES),
      },
      {
        path: 'auth',
        loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
      {
        path: 'not-found',
        loadChildren: () =>
          import('@features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES),
      },
      { path: '**', redirectTo: 'not-found' },
    ],
  },
];
