import { Component, computed, input, signal } from '@angular/core';

const SWIPE_THRESHOLD_PX = 48;

@Component({
  selector: 'app-passport-book',
  templateUrl: './passport-book.html',
  styleUrl: './passport-book.css',
  host: {
    '(pointerdown)': 'startSwipe($event)',
    '(pointerup)': 'endSwipe($event)',
    '(pointercancel)': 'cancelSwipe()',
    '(keydown.arrowleft)': 'previous()',
    '(keydown.arrowright)': 'next()',
    tabindex: '0',
  },
})
export class PassportBook {
  readonly pageLabels = input.required<readonly string[]>();

  protected readonly index = signal(0);
  protected readonly offset = computed(() => `translateX(-${this.index() * 100}%)`);

  private swipeStartX: number | null = null;

  protected goTo(index: number): void {
    this.index.set(Math.min(Math.max(index, 0), this.pageLabels().length - 1));
  }

  protected previous(): void {
    this.goTo(this.index() - 1);
  }

  protected next(): void {
    this.goTo(this.index() + 1);
  }

  protected startSwipe(event: PointerEvent): void {
    this.swipeStartX = event.clientX;
  }

  protected cancelSwipe(): void {
    this.swipeStartX = null;
  }

  protected endSwipe(event: PointerEvent): void {
    if (this.swipeStartX === null) {
      return;
    }
    const delta = event.clientX - this.swipeStartX;
    this.swipeStartX = null;

    if (delta <= -SWIPE_THRESHOLD_PX) {
      this.next();
      return;
    }
    if (delta >= SWIPE_THRESHOLD_PX) {
      this.previous();
    }
  }
}
