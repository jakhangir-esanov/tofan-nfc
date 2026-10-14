import { Component, model } from '@angular/core';

@Component({
  selector: 'app-passport-book',
  templateUrl: './passport-book.html',
  styleUrl: './passport-book.css',
})
export class PassportBook {
  readonly opened = model(false);

  protected open(): void {
    this.opened.set(true);
  }
}
