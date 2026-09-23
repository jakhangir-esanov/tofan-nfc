import { GarmentDto } from '@shared/models/garment.dto';

export enum GarmentScanStateDto {
  Invalid = 1,
  Unclaimed = 2,
  Claimable = 3,
  Owned = 4,
  Expired = 5,
  Foreign = 6,
}

export enum GarmentInvalidReasonDto {
  Unknown = 1,
  Revoked = 2,
  Hidden = 3,
}

export interface GarmentScanDto {
  state: GarmentScanStateDto;
  reason: GarmentInvalidReasonDto | null;
  garment: GarmentDto | null;
}
