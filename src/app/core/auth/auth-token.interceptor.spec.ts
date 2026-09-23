import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@core/http/api-base-url';
import { AuthSession } from './auth-session';
import { AuthSessionStorage } from './auth-session.storage';
import { authTokenInterceptor } from './auth-token.interceptor';

function createValidSession(): AuthSession {
  return new AuthSession('token-123', new Date(Date.now() + 3600_000));
}

function createExpiredSession(): AuthSession {
  return new AuthSession('token-123', new Date(Date.now() - 3600_000));
}

function setup(session: AuthSession | null): {
  client: HttpClient;
  httpMock: HttpTestingController;
} {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authTokenInterceptor])),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '/api' },
      { provide: AuthSessionStorage, useValue: { get: () => session } },
    ],
  });

  return {
    client: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('authTokenInterceptor', () => {
  it('should attach bearer token when request url starts with api base url and session is valid', () => {
    const { client, httpMock } = setup(createValidSession());

    client.get('/api/garments/test').subscribe();

    const request = httpMock.expectOne('/api/garments/test');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-123');
    request.flush({});
    httpMock.verify();
  });

  it('should not attach bearer token when request url is external', () => {
    const { client, httpMock } = setup(createValidSession());

    client.get('https://example.com/api/test').subscribe();

    const request = httpMock.expectOne('https://example.com/api/test');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
    httpMock.verify();
  });

  it('should not attach bearer token when session is null', () => {
    const { client, httpMock } = setup(null);

    client.get('/api/garments/test').subscribe();

    const request = httpMock.expectOne('/api/garments/test');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
    httpMock.verify();
  });

  it('should not attach bearer token when session is expired', () => {
    const { client, httpMock } = setup(createExpiredSession());

    client.get('/api/garments/test').subscribe();

    const request = httpMock.expectOne('/api/garments/test');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
    httpMock.verify();
  });
});
