import { GarmentColor } from './garment-color';

export interface Garment {
  readonly serialNumber: string;
  readonly model: string;
  readonly color: string;
  readonly size: string;
  readonly material: string;
  readonly manufacturedAt: Date;
  readonly knownColor: GarmentColor | null;
  readonly shade: string;
}
