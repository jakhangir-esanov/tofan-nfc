import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AuthStore } from '@core/auth/auth.store';
import { UserProfile } from '@core/auth/models/user-profile';
import { PassportProfile } from './passport-profile';

function render(holder: string): { host: HTMLElement; logout: ReturnType<typeof vi.fn> } {
  const logout = vi.fn().mockResolvedValue(undefined);
  const currentUser = signal(new UserProfile('u1', 'jahongir@example.com', 'Jahongir Esanov'));
  TestBed.configureTestingModule({
    providers: [{ provide: AuthStore, useValue: { currentUser, logout } }],
  });

  const fixture = TestBed.createComponent(PassportProfile);
  fixture.componentRef.setInput('holder', holder);
  fixture.detectChanges();
  return { host: fixture.nativeElement as HTMLElement, logout };
}

describe('PassportProfile', () => {
  it('should show the holder with the account name when the owner has a profile', () => {
    const { host } = render('Jahongir Esanov');

    expect(host.textContent).toContain('Jahongir Esanov');
    expect(host.textContent).toContain('jahongir@example.com');
    expect(host.querySelector('.profile__avatar')?.textContent).toBe('J');
  });

  it('should show the account name once when the owner has no profile yet', () => {
    const { host } = render('');

    expect(host.querySelector('.profile__name')?.textContent).toBe('jahongir@example.com');
    expect(host.querySelector('.profile__username')).toBeNull();
  });

  it('should sign the owner out when the sign-out button is pressed', () => {
    const { host, logout } = render('Jahongir Esanov');

    host.querySelector<HTMLButtonElement>('.app-button')?.click();

    expect(logout).toHaveBeenCalledOnce();
  });
});
