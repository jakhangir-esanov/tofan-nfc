import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = (_route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID)) || inject(AuthStore).hasSession()) {
    return true;
  }

  return inject(Router).createUrlTree([AppPaths.login], {
    queryParams: { returnUrl: state.url },
  });
};
