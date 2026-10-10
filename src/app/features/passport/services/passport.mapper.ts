import { ImageUrlOf, toGarment } from '@shared/models/garment.mapper';
import { Passport, PassportStanding } from '../models/passport';
import { PassportDto, PassportStandingDto } from './passport.dto';

export function toPassport(dto: PassportDto, imageUrlOf: ImageUrlOf): Passport {
  return {
    garment: toGarment(dto.garment, imageUrlOf),
    holder: { firstName: dto.owner.firstName, lastName: dto.owner.lastName },
    activatedAt: new Date(dto.activatedAt),
    expiresAt: new Date(dto.expiresAt),
    isExpired: dto.isExpired,
    standing: dto.standing === null || dto.standing === undefined ? null : toStanding(dto.standing),
  };
}

function toStanding(dto: PassportStandingDto): PassportStanding {
  return {
    rank: dto.rank ?? null,
    lifetimeDp: dto.lifetimeDp,
    levelNames:
      dto.level === null || dto.level === undefined
        ? null
        : { uz: dto.level.nameUz, ru: dto.level.nameRu, en: dto.level.name },
  };
}
