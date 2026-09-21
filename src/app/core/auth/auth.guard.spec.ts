import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthStore } from './auth.store';

function runGuard(hasSession: boolean, url: string): boolean | UrlTree {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthStore, useValue: { hasSession: () => hasSession } }],
  });

  const state = { url } as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() =>
    authGuard({} as never, state),
  ) as boolean | UrlTree;
}

describe('authGuard', () => {
  it('should let the visitor through when a session exists', () => {
    expect(runGuard(true, '/t/abc123/activate')).toBe(true);
  });

  it('should send the visitor to login with the full nfc route as return url', () => {
    const result = runGuard(false, '/t/abc123/activate');
    const router = TestBed.inject(Router);

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/auth/login?returnUrl=%2Ft%2Fabc123%2Factivate',
    );
  });

  it('should keep the token in the return url when the passport is requested', () => {
    const result = runGuard(false, '/t/abc123/passport');
    const router = TestBed.inject(Router);

    expect(router.serializeUrl(result as UrlTree)).toContain('abc123%2Fpassport');
  });
});
