import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PasswordInput } from './password-input';

async function render(inputs: Record<string, unknown>): Promise<ComponentFixture<PasswordInput>> {
  const fixture = TestBed.createComponent(PasswordInput);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function hostOf(fixture: ComponentFixture<PasswordInput>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function fieldOf(fixture: ComponentFixture<PasswordInput>): HTMLInputElement {
  const field = hostOf(fixture).querySelector<HTMLInputElement>('input');
  if (field === null) {
    throw new Error('The password field is missing.');
  }
  return field;
}

function toggleOf(fixture: ComponentFixture<PasswordInput>): HTMLButtonElement {
  const toggle = hostOf(fixture).querySelector<HTMLButtonElement>('button.password-input__toggle');
  if (toggle === null) {
    throw new Error('The show password button is missing.');
  }
  return toggle;
}

describe('PasswordInput', () => {
  it('should not mark the field invalid when the user has not touched it yet', async () => {
    const fixture = await render({ invalid: true });

    expect(fieldOf(fixture).classList).not.toContain('p-invalid');
  });

  it('should mark the field invalid when the invalid field was touched', async () => {
    const fixture = await render({ invalid: true, touched: true });

    expect(fieldOf(fixture).classList).toContain('p-invalid');
  });

  it('should pass the typed password to the model when the user types', async () => {
    const fixture = await render({});
    const field = fieldOf(fixture);

    field.value = 'Passw0rd!23';
    field.dispatchEvent(new Event('input'));

    expect(fixture.componentInstance.value()).toBe('Passw0rd!23');
  });

  it('should report a touch when the field loses focus', async () => {
    const fixture = await render({});
    const touched = vi.fn();
    fixture.componentInstance.touch.subscribe(touched);

    fieldOf(fixture).dispatchEvent(new Event('blur'));

    expect(touched).toHaveBeenCalled();
  });

  it('should reveal and hide the password when the eye button is pressed', async () => {
    const fixture = await render({});

    expect(fieldOf(fixture).type).toBe('password');
    expect(toggleOf(fixture).getAttribute('aria-label')).toBe("Parolni ko'rsatish");

    toggleOf(fixture).click();
    fixture.detectChanges();

    expect(fieldOf(fixture).type).toBe('text');
    expect(toggleOf(fixture).getAttribute('aria-label')).toBe('Parolni yashirish');

    toggleOf(fixture).click();
    fixture.detectChanges();

    expect(fieldOf(fixture).type).toBe('password');
  });
});
