import { GarmentDto } from '@shared/models/garment.dto';

export interface PassportLevelDto {
  name: string;
  nameRu: string;
  nameUz: string;
  badgeIcon: string | null;
}

export interface PassportStandingDto {
  rank: number | null;
  lifetimeDp: number;
  level: PassportLevelDto | null;
}

export interface PassportDto {
  garment: GarmentDto;
  owner: { firstName: string; lastName: string };
  activatedAt: string;
  expiresAt: string;
  isExpired: boolean;
  standing: PassportStandingDto | null;
}
