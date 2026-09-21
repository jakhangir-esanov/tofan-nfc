import { DomainError } from '@shared/models/errors/domain.error';

export const SCAN_CONTRACT_CODE = 'Garment.UnsupportedScanResponse';

export class ScanContractError extends DomainError {
  constructor(message: string) {
    super(message, SCAN_CONTRACT_CODE);
  }
}
