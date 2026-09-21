import { GarmentDto } from '@shared/models/garment.dto';

export enum GarmentScanStateDto {
  Invalid = 1,
  Unclaimed = 2,
  Claimable = 3,
  Owned = 4,
  Expired = 5,
  Foreign = 6,
}

export interface GarmentScanDto {
  state: GarmentScanStateDto;
  garment: GarmentDto | null;
}
