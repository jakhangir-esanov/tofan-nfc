import { Component, input, output } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';

@Component({
  selector: 'app-state-screen',
  imports: [ButtonModule],
  templateUrl: './state-screen.html',
  styleUrl: './state-screen.css',
})
export class StateScreen {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly retry = output<void>();
}
