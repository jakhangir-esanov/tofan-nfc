import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AuthStore } from './auth.store';
import { sessionInterceptor } from './session.interceptor';

function setup(options: {
  hasSession: boolean;
  renewSession: () => Promise<unknown>;
  logout: () => Promise<void>;
}): {
  client: HttpClient;
  httpMock: HttpTestingController;
} {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([sessionInterceptor])),
      provideHttpClientTesting(),
      {
        provide: AuthStore,
        useValue: {
          hasSession: () => options.hasSession,
          renewSession: options.renewSession,
          logout: options.logout,
        },
      },
    ],
  });

  return {
    client: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('sessionInterceptor', () => {
  it('should pass request through when response status is not 401', () => {
    const renewSession = vi.fn().mockResolvedValue(undefined);
    const logout = vi.fn().mockResolvedValue(undefined);
    const { client, httpMock } = setup({ hasSession: true, renewSession, logout });

    let responseError: HttpErrorResponse | null = null;
    client.get('/api/test').subscribe({
      error: (error: HttpErrorResponse) => {
        responseError = error;
      },
    });

    const request = httpMock.expectOne('/api/test');
    request.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(responseError).toBeInstanceOf(HttpErrorResponse);
    expect(responseError ? (responseError as HttpErrorResponse).status : 0).toBe(403);
    expect(renewSession).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    httpMock.verify();
  });

  it('should pass error through when 401 occurs but there is no session', () => {
    const renewSession = vi.fn().mockResolvedValue(undefined);
    const logout = vi.fn().mockResolvedValue(undefined);
    const { client, httpMock } = setup({ hasSession: false, renewSession, logout });

    let responseError: HttpErrorResponse | null = null;
    client.get('/api/test').subscribe({
      error: (error: HttpErrorResponse) => {
        responseError = error;
      },
    });

    const request = httpMock.expectOne('/api/test');
    request.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(responseError).toBeInstanceOf(HttpErrorResponse);
    expect(responseError ? (responseError as HttpErrorResponse).status : 0).toBe(401);
    expect(renewSession).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    httpMock.verify();
  });

  it('should retry request once when 401 occurs and renewSession succeeds', async () => {
    const renewSession = vi.fn().mockResolvedValue(undefined);
    const logout = vi.fn().mockResolvedValue(undefined);
    const { client, httpMock } = setup({ hasSession: true, renewSession, logout });

    let responseData: unknown = null;
    client.get('/api/test').subscribe({
      next: (data) => {
        responseData = data;
      },
    });

    const initialRequest = httpMock.expectOne('/api/test');
    initialRequest.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await Promise.resolve();

    const retriedRequest = httpMock.expectOne('/api/test');
    retriedRequest.flush({ success: true });

    expect(renewSession).toHaveBeenCalledTimes(1);
    expect(logout).not.toHaveBeenCalled();
    expect(responseData).toEqual({ success: true });
    httpMock.verify();
  });

  it('should call logout and pass error through when 401 occurs and renewSession fails', async () => {
    const renewalError = new Error('Renewal failed');
    const renewSession = vi.fn().mockRejectedValue(renewalError);
    const logout = vi.fn().mockResolvedValue(undefined);
    const { client, httpMock } = setup({ hasSession: true, renewSession, logout });

    let caughtError: unknown = null;
    client.get('/api/test').subscribe({
      error: (error: unknown) => {
        caughtError = error;
      },
    });

    const initialRequest = httpMock.expectOne('/api/test');
    initialRequest.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await Promise.resolve();

    expect(renewSession).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(caughtError).toBe(renewalError);
    httpMock.verify();
  });
});
