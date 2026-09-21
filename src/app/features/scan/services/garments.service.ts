import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { GarmentScan } from '../models/garment-scan';
import { GarmentScanDto } from './garment-scan.dto';
import { toGarmentScan } from './garment-scan.mapper';

@Injectable({ providedIn: 'root' })
export class GarmentsService {
  private readonly apiClient = inject(ApiClient);

  async scan(token: string): Promise<GarmentScan> {
    const dto = await this.apiClient.get<GarmentScanDto>(scanPath(token));
    return toGarmentScan(dto);
  }

  async claim(token: string): Promise<GarmentScan> {
    const dto = await this.apiClient.post<GarmentScanDto>(`${scanPath(token)}/claim`);
    return toGarmentScan(dto);
  }
}

function scanPath(token: string): string {
  return `/garments/by-token/${encodeURIComponent(token)}`;
}
