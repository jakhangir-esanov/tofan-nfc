import { GarmentColor } from './garment-color';

export interface Garment {
  readonly serialNumber: string;
  readonly dropName: string;
  readonly editionNumber: number;
  readonly dropTotalQuantity: number;
  readonly variantName: string;
  readonly imageUrl: string | null;
  readonly color: string;
  readonly size: string;
  readonly material: string;
  readonly manufacturedAt: Date;
  readonly knownColor: GarmentColor | null;
  readonly shade: string;
}
