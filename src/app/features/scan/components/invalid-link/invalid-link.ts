import { Component, input } from '@angular/core';
import { InvalidReason } from '../../models/garment-scan';

@Component({
  selector: 'app-invalid-link',
  templateUrl: './invalid-link.html',
  styleUrl: './invalid-link.css',
})
export class InvalidLink {
  readonly reason = input.required<InvalidReason>();
}
