import { DomainError } from './domain.error';

export class AccessDeniedError extends DomainError {
  constructor(message = 'Access is denied.', code = '') {
    super(message, code);
  }
}
