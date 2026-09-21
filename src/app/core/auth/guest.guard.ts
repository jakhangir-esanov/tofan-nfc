import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { safeReturnUrl } from './return-url';

export const guestGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  if (!inject(AuthStore).hasSession()) {
    return true;
  }

  return inject(Router).parseUrl(safeReturnUrl(route.queryParamMap.get('returnUrl')));
};
