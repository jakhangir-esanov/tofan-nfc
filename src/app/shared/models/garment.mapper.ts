import { Garment } from './garment';
import { garmentShadeOf, toGarmentColor } from './garment-color';
import { GarmentDto } from './garment.dto';

export type ImageUrlOf = (fileId: string) => string;

export function garmentImagePath(fileId: string): string {
  return `/files/${encodeURIComponent(fileId)}/content`;
}

export function toGarment(dto: GarmentDto, imageUrlOf: ImageUrlOf): Garment {
  return {
    serialNumber: dto.serialNumber,
    dropName: dto.dropName,
    editionNumber: dto.editionNumber,
    dropTotalQuantity: dto.dropTotalQuantity,
    variantName: dto.variantName,
    imageUrl:
      dto.imageFileId === null || dto.imageFileId === undefined
        ? null
        : imageUrlOf(dto.imageFileId),
    color: dto.color,
    size: dto.size,
    material: dto.material,
    manufacturedAt: new Date(dto.manufacturedAt),
    knownColor: toGarmentColor(dto.color),
    shade: garmentShadeOf(dto.color),
  };
}
