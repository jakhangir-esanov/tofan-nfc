import { DomainError } from '@shared/models/errors/domain.error';

export class SessionExpiredError extends DomainError {
  constructor(message = 'The session has expired.') {
    super(message);
  }
}
