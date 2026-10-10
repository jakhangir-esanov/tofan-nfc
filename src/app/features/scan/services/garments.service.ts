import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { garmentImagePath } from '@shared/models/garment.mapper';
import { GarmentScan } from '../models/garment-scan';
import { GarmentScanDto } from './garment-scan.dto';
import { toGarmentScan } from './garment-scan.mapper';

@Injectable({ providedIn: 'root' })
export class GarmentsService {
  private readonly apiClient = inject(ApiClient);

  async scan(token: string): Promise<GarmentScan> {
    const dto = await this.apiClient.get<GarmentScanDto>(scanPath(token));
    return toGarmentScan(dto, this.imageUrl);
  }

  async claim(token: string): Promise<GarmentScan> {
    const dto = await this.apiClient.post<GarmentScanDto>(`${scanPath(token)}/claim`);
    return toGarmentScan(dto, this.imageUrl);
  }

  private readonly imageUrl = (fileId: string): string =>
    this.apiClient.url(garmentImagePath(fileId));
}

function scanPath(token: string): string {
  return `/garments/by-token/${encodeURIComponent(token)}`;
}
