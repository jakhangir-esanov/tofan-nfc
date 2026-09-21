import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthStore } from './auth.store';

export const sessionInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!hasStatus(error, HttpStatusCode.Unauthorized) || !authStore.hasSession()) {
        return throwError(() => error);
      }

      return from(authStore.renewSession()).pipe(
        switchMap(() => next(request)),
        catchError((renewalError: unknown) => {
          void authStore.logout();
          return throwError(() => renewalError);
        }),
      );
    }),
  );
};

function hasStatus(error: unknown, status: HttpStatusCode): boolean {
  return error instanceof HttpErrorResponse && error.status === status;
}
