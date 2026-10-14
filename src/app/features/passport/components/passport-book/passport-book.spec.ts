import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PassportBook } from './passport-book';

@Component({
  imports: [PassportBook],
  template: `
    <app-passport-book [(opened)]="opened">
      <span bookCover>Cover</span>
      <section>Data</section>
    </app-passport-book>
  `,
})
class PassportBookHost {
  readonly opened = signal(false);
}

async function render(): Promise<ComponentFixture<PassportBookHost>> {
  const fixture = TestBed.createComponent(PassportBookHost);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function partOf(fixture: ComponentFixture<PassportBookHost>, selector: string): HTMLElement {
  const part = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);
  if (part === null) {
    throw new Error(`The passport book has no ${selector}.`);
  }
  return part;
}

describe('PassportBook', () => {
  it('should show the closed cover over the pages when the book is first shown', async () => {
    const fixture = await render();

    expect(partOf(fixture, '.passport-book__cover').getAttribute('aria-expanded')).toBe('false');
    expect(partOf(fixture, '.passport-book__pages').hasAttribute('inert')).toBe(true);
    expect(partOf(fixture, '.passport-book__cover').textContent).toContain('Cover');
  });

  it('should open the pages and tell the host when the cover is tapped', async () => {
    const fixture = await render();

    partOf(fixture, '.passport-book__cover').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.opened()).toBe(true);
    expect(partOf(fixture, '.passport-book__pages').hasAttribute('inert')).toBe(false);
    expect(partOf(fixture, '.passport-book__cover').getAttribute('aria-hidden')).toBe('true');
  });

  it('should open when the cover is activated from the keyboard', async () => {
    const fixture = await render();

    partOf(fixture, '.passport-book__cover').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter' }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.opened()).toBe(true);
  });
});
