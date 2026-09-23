import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthFormStore } from '../../auth-form.store';
import { RegisterPage } from './register-page';

interface StoreDouble {
  readonly register: ReturnType<typeof vi.fn>;
  readonly submitting: () => boolean;
  readonly submitError: () => string | null;
}

function render(): { fixture: ComponentFixture<RegisterPage>; store: StoreDouble } {
  const store: StoreDouble = {
    register: vi.fn().mockResolvedValue(false),
    submitting: () => false,
    submitError: () => null,
  };
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  TestBed.overrideComponent(RegisterPage, {
    set: { providers: [{ provide: AuthFormStore, useValue: store }] },
  });
  const fixture = TestBed.createComponent(RegisterPage);
  fixture.detectChanges();
  return { fixture, store };
}

function hostOf(fixture: ComponentFixture<RegisterPage>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function type(host: HTMLElement, selector: string, text: string): void {
  const input = host.querySelector<HTMLInputElement>(selector);
  if (input === null) {
    throw new Error(`The input ${selector} is missing.`);
  }
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

function fillEverythingButGender(host: HTMLElement): void {
  type(host, 'input[autocomplete="given-name"]', 'Jahongir');
  type(host, 'input[autocomplete="family-name"]', 'Esanov');
  type(host, 'input[type="email"]', 'jahongir@example.com');
  type(host, 'app-password-input input', 'Passw0rd!23');
}

async function submit(fixture: ComponentFixture<RegisterPage>): Promise<void> {
  hostOf(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('RegisterPage', () => {
  it('should ask for the gender and not register when none is chosen', async () => {
    const { fixture, store } = render();
    fillEverythingButGender(hostOf(fixture));

    await submit(fixture);

    expect(hostOf(fixture).textContent).toContain('Jinsingizni tanlang');
    expect(store.register).not.toHaveBeenCalled();
  });

  it('should register with the chosen gender when every field is filled', async () => {
    const { fixture, store } = render();
    const host = hostOf(fixture);
    fillEverythingButGender(host);
    host.querySelector<HTMLInputElement>('input[type="radio"][value="female"]')?.click();

    await submit(fixture);

    expect(store.register).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Jahongir', gender: 'female' }),
    );
  });
});
