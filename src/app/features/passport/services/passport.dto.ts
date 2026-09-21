import { GarmentDto } from '@shared/models/garment.dto';

export enum StampKindDto {
  PersonalRecord = 1,
  Achievement = 2,
  Rank = 3,
  Special = 4,
}

export interface StampDto {
  id: string;
  code: string;
  title: string;
  iconUrl: string | null;
  kind: StampKindDto;
  awardedAt: string;
}

export interface PassportDto {
  garment: GarmentDto;
  owner: { firstName: string; lastName: string };
  activatedAt: string;
  expiresAt: string;
  isExpired: boolean;
  rating: number | null;
  stamps: StampDto[];
}
