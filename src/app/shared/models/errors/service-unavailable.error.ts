import { DomainError } from './domain.error';

export class ServiceUnavailableError extends DomainError {
  constructor(message = 'The service is unavailable.', code = '') {
    super(message, code);
  }
}
