import { toGarment } from '@shared/models/garment.mapper';
import { Passport } from '../models/passport';
import { PassportDto } from './passport.dto';

export function toPassport(dto: PassportDto): Passport {
  return {
    garment: toGarment(dto.garment),
    holder: { firstName: dto.owner.firstName, lastName: dto.owner.lastName },
    activatedAt: new Date(dto.activatedAt),
    expiresAt: new Date(dto.expiresAt),
    isExpired: dto.isExpired,
  };
}
