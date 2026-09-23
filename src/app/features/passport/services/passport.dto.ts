import { GarmentDto } from '@shared/models/garment.dto';

export interface PassportDto {
  garment: GarmentDto;
  owner: { firstName: string; lastName: string };
  activatedAt: string;
  expiresAt: string;
  isExpired: boolean;
}
