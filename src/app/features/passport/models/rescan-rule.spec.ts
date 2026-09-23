import { describe, expect, it } from 'vitest';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { needsRescan } from './rescan-rule';

describe('needsRescan', () => {
  it('should ask for a rescan when the caller is not the owner', () => {
    expect(needsRescan(new BusinessRuleError('not owner', 'Garment.NotOwner'))).toBe(true);
  });

  it('should ask for a rescan when the token is unknown', () => {
    expect(needsRescan(new NotFoundError('missing', 'Garment.NotFound'))).toBe(true);
  });

  it('should ask for a rescan when the shirt was hidden or revoked', () => {
    expect(needsRescan(new ConflictError('gone', 'Garment.NotAvailable'))).toBe(true);
  });

  it('should not ask for a rescan when a transport status carries no garment code', () => {
    expect(needsRescan(new AccessDeniedError())).toBe(false);
  });

  it('should not ask for a rescan when the request failed for a network reason', () => {
    expect(needsRescan(new ServiceUnavailableError())).toBe(false);
  });
});
