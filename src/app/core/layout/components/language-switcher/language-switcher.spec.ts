import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LanguageSwitcher } from './language-switcher';

function render(): ComponentFixture<LanguageSwitcher> {
  TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'ru' }] });
  const fixture = TestBed.createComponent(LanguageSwitcher);
  fixture.detectChanges();
  return fixture;
}

function hostOf(fixture: ComponentFixture<LanguageSwitcher>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function toggle(fixture: ComponentFixture<LanguageSwitcher>): void {
  hostOf(fixture).querySelector<HTMLButtonElement>('.language-switcher__toggle')?.click();
  fixture.detectChanges();
}

describe('LanguageSwitcher', () => {
  it('should show only the current language when the menu is closed', () => {
    const host = hostOf(render());

    expect(host.querySelector('.language-switcher__toggle')?.textContent).toContain('ru');
    expect(host.querySelector('[role="menu"]')).toBeNull();
  });

  it('should list every language with the current one checked when the menu is opened', () => {
    const fixture = render();

    toggle(fixture);
    const options = hostOf(fixture).querySelectorAll('[role="menuitemradio"]');

    expect(options).toHaveLength(3);
    expect(hostOf(fixture).querySelector('[aria-checked="true"]')?.textContent).toContain(
      'Русский',
    );
  });

  it('should close the menu when the visitor clicks outside it', () => {
    const fixture = render();
    toggle(fixture);

    document.body.click();
    fixture.detectChanges();

    expect(hostOf(fixture).querySelector('[role="menu"]')).toBeNull();
  });

  it('should close the menu without leaving the page when the current language is picked', () => {
    const fixture = render();
    toggle(fixture);

    hostOf(fixture).querySelector<HTMLButtonElement>('[aria-checked="true"]')?.click();
    fixture.detectChanges();

    expect(hostOf(fixture).querySelector('[role="menu"]')).toBeNull();
  });
});
