import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { PasswordModule } from '@openng/optimus-ui/password';

const TOGGLE_ROOM = { 'padding-inline-end': '3.25rem' };

@Component({
  selector: 'app-password-input',
  imports: [FormsModule, PasswordModule],
  templateUrl: './password-input.html',
  styleUrl: './password-input.css',
})
export class PasswordInput implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly touch = output<void>();

  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly touched = input<boolean>(false);
  readonly feedback = input<boolean>(false);
  readonly toggleMask = input<boolean>(true);
  readonly autocomplete = input<string>('current-password');
  readonly inputId = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);

  protected readonly toggleRoom = TOGGLE_ROOM;
  protected readonly showLabel = $localize`:@@password.show:Parolni ko'rsatish`;
  protected readonly hideLabel = $localize`:@@password.hide:Parolni yashirish`;

  protected onModelChange(nextValue: string | null): void {
    this.value.set(nextValue ?? '');
  }
}
