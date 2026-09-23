import { Garment } from './garment';
import { garmentShadeOf, toGarmentColor } from './garment-color';
import { GarmentDto } from './garment.dto';

export function toGarment(dto: GarmentDto): Garment {
  return {
    serialNumber: dto.serialNumber,
    model: dto.model,
    color: dto.color,
    size: dto.size,
    material: dto.material,
    manufacturedAt: new Date(dto.manufacturedAt),
    knownColor: toGarmentColor(dto.color),
    shade: garmentShadeOf(dto.color),
  };
}
