import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, convertToParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { guestGuard } from './guest.guard';
import { AuthStore } from './auth.store';

function runGuard(hasSession: boolean, returnUrl: string | null): boolean | UrlTree {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthStore, useValue: { hasSession: () => hasSession } }],
  });

  const route = {
    queryParamMap: convertToParamMap(returnUrl === null ? {} : { returnUrl }),
  } as ActivatedRouteSnapshot;

  return TestBed.runInInjectionContext(() => guestGuard(route, {} as never)) as boolean | UrlTree;
}

describe('guestGuard', () => {
  it('should show the form when there is no session', () => {
    expect(runGuard(false, '/t/abc123')).toBe(true);
  });

  it('should send a signed in visitor back to the shirt they scanned', () => {
    const result = runGuard(true, '/t/abc123/activate');
    const router = TestBed.inject(Router);

    expect(router.serializeUrl(result as UrlTree)).toBe('/t/abc123/activate');
  });

  it('should fall back to home when a signed in visitor carries no return url', () => {
    const result = runGuard(true, null);
    const router = TestBed.inject(Router);

    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });

  it('should refuse a return url that points at another host', () => {
    const result = runGuard(true, 'https://evil.test/steal');
    const router = TestBed.inject(Router);

    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });
});
