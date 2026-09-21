import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { API_BASE_URL } from './api-base-url';
import { authTokenInterceptor } from '@core/auth/auth-token.interceptor';
import { sessionInterceptor } from '@core/auth/session.interceptor';

export function provideHttp(apiBaseUrl: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_BASE_URL, useValue: apiBaseUrl },
    provideHttpClient(withFetch(), withInterceptors([sessionInterceptor, authTokenInterceptor])),
  ]);
}
