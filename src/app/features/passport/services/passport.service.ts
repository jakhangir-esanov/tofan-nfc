import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { garmentImagePath } from '@shared/models/garment.mapper';
import { Passport } from '../models/passport';
import { PassportDto } from './passport.dto';
import { toPassport } from './passport.mapper';

@Injectable({ providedIn: 'root' })
export class PassportService {
  private readonly apiClient = inject(ApiClient);

  async read(token: string): Promise<Passport> {
    const path = `/garments/by-token/${encodeURIComponent(token)}/passport`;
    return toPassport(await this.apiClient.get<PassportDto>(path), (fileId) =>
      this.apiClient.url(garmentImagePath(fileId)),
    );
  }
}
