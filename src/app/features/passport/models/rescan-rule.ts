import { DomainError } from '@shared/models/errors/domain.error';

const RESCAN_CODES: ReadonlySet<string> = new Set([
  'Garment.NotOwner',
  'Garment.NotFound',
  'Garment.NotAvailable',
]);

export function needsRescan(error: unknown): boolean {
  return error instanceof DomainError && RESCAN_CODES.has(error.code);
}
