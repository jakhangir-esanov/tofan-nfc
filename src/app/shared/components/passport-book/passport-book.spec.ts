import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PassportBook } from './passport-book';

@Component({
  imports: [PassportBook],
  template: `
    <app-passport-book [pageLabels]="labels">
      <section>Cover</section>
      <section>Data</section>
    </app-passport-book>
  `,
})
class PassportBookHost {
  protected readonly labels = ['Cover', 'Data'];
}

async function render(): Promise<ComponentFixture<PassportBookHost>> {
  const fixture = TestBed.createComponent(PassportBookHost);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function bookOf(fixture: ComponentFixture<PassportBookHost>): HTMLElement {
  const book = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('app-passport-book');
  if (book === null) {
    throw new Error('The passport book is missing.');
  }
  return book;
}

function activePageOf(fixture: ComponentFixture<PassportBookHost>): string | null {
  const dot = bookOf(fixture).querySelector('[aria-current="page"]');
  return dot === null ? null : dot.getAttribute('aria-label');
}

function pointer(fixture: ComponentFixture<PassportBookHost>, type: string, clientX: number): void {
  bookOf(fixture).dispatchEvent(new MouseEvent(type, { clientX, bubbles: true }));
  fixture.detectChanges();
}

describe('PassportBook', () => {
  it('should open the cover when the book is first shown', async () => {
    const fixture = await render();

    expect(activePageOf(fixture)).toBe('Cover');
  });

  it('should turn to the next page when the user swipes left', async () => {
    const fixture = await render();

    pointer(fixture, 'pointerdown', 300);
    pointer(fixture, 'pointerup', 100);

    expect(activePageOf(fixture)).toBe('Data');
  });

  it('should turn back to the previous page when the user swipes right', async () => {
    const fixture = await render();
    pointer(fixture, 'pointerdown', 300);
    pointer(fixture, 'pointerup', 100);

    pointer(fixture, 'pointerdown', 100);
    pointer(fixture, 'pointerup', 300);

    expect(activePageOf(fixture)).toBe('Cover');
  });

  it('should stay on the page when the swipe is shorter than the threshold', async () => {
    const fixture = await render();

    pointer(fixture, 'pointerdown', 300);
    pointer(fixture, 'pointerup', 280);

    expect(activePageOf(fixture)).toBe('Cover');
  });

  it('should ignore a stray pointer up when the browser cancelled the gesture', async () => {
    const fixture = await render();

    pointer(fixture, 'pointerdown', 300);
    pointer(fixture, 'pointercancel', 250);
    pointer(fixture, 'pointerup', 100);

    expect(activePageOf(fixture)).toBe('Cover');
  });

  it('should let horizontal swipes reach the book when used on a touch screen', async () => {
    const fixture = await render();
    const viewport = bookOf(fixture).querySelector<HTMLElement>('.passport-book__viewport');
    if (viewport === null) {
      throw new Error('The passport viewport is missing.');
    }

    expect(getComputedStyle(viewport).touchAction).toBe('pan-y');
  });
});
