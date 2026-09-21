export interface Garment {
  readonly serialNumber: string;
  readonly model: string;
  readonly color: string;
  readonly size: string;
  readonly material: string;
  readonly manufacturedAt: Date;
  readonly photoUrls: readonly string[];
}
