import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthSessionStorage } from '@core/auth/auth-session.storage';
import { API_BASE_URL } from '@core/http/api-base-url';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  const session = inject(AuthSessionStorage).get();

  if (!request.url.startsWith(apiBaseUrl) || session === null || session.isExpired()) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${session.accessToken}` } }));
};
