import { toGarment } from '@shared/models/garment.mapper';
import { enumMap } from '@shared/utils/enum-map';
import { Passport } from '../models/passport';
import { Stamp, StampKind } from '../models/stamp';
import { PassportDto, StampDto, StampKindDto } from './passport.dto';

const stampKindMap = enumMap<StampKind, StampKindDto>(StampKindDto);

export function toPassport(dto: PassportDto): Passport {
  return {
    garment: toGarment(dto.garment),
    holder: { firstName: dto.owner.firstName, lastName: dto.owner.lastName },
    activatedAt: new Date(dto.activatedAt),
    expiresAt: new Date(dto.expiresAt),
    isExpired: dto.isExpired,
    rating: dto.rating,
    stamps: dto.stamps.map(toStamp),
  };
}

function toStamp(dto: StampDto): Stamp {
  return {
    id: dto.id,
    code: dto.code,
    title: dto.title,
    iconUrl: dto.iconUrl,
    kind: stampKindMap.toDomain(dto.kind),
    awardedAt: new Date(dto.awardedAt),
  };
}
