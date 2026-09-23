import { toGarment } from '@shared/models/garment.mapper';
import { enumMap } from '@shared/utils/enum-map';
import { GarmentScan, InvalidReason, ScanState } from '../models/garment-scan';
import { ScanContractError } from '../models/scan-contract.error';
import { GarmentInvalidReasonDto, GarmentScanDto, GarmentScanStateDto } from './garment-scan.dto';

const scanStateMap = enumMap<ScanState, GarmentScanStateDto>(GarmentScanStateDto);
const invalidReasonMap = enumMap<InvalidReason, GarmentInvalidReasonDto>(GarmentInvalidReasonDto);

export function toGarmentScan(dto: GarmentScanDto): GarmentScan {
  const state = toScanState(dto.state);
  if (state === 'invalid') {
    return { state, reason: toInvalidReason(dto.reason) };
  }

  if (dto.garment === null) {
    throw new ScanContractError(`The scan response for '${state}' is missing the garment.`);
  }

  return { state, garment: toGarment(dto.garment) };
}

function toScanState(value: GarmentScanStateDto): ScanState {
  try {
    return scanStateMap.toDomain(value);
  } catch {
    throw new ScanContractError(`The backend returned the unknown scan state ${value}.`);
  }
}

function toInvalidReason(value: GarmentInvalidReasonDto | null): InvalidReason {
  if (value === null) {
    throw new ScanContractError('The invalid scan response is missing its reason.');
  }
  try {
    return invalidReasonMap.toDomain(value);
  } catch {
    throw new ScanContractError(`The backend returned the unknown invalid reason ${value}.`);
  }
}
