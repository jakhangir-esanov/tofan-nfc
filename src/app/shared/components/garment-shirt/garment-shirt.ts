import { Component, input } from '@angular/core';

let nextShirtId = 0;

@Component({
  selector: 'app-garment-shirt',
  templateUrl: './garment-shirt.html',
  styleUrl: './garment-shirt.css',
})
export class GarmentShirt {
  readonly shade = input.required<string>();
  readonly label = input.required<string>();

  private readonly id = nextShirtId++;

  protected readonly volumeId = `garment-shirt-volume-${this.id}`;
  protected readonly foldId = `garment-shirt-fold-${this.id}`;
  protected readonly volumeFill = `url(#${this.volumeId})`;
  protected readonly foldFill = `url(#${this.foldId})`;
}
