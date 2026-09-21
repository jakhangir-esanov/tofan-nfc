import { DomainError } from './domain.error';

export class RateLimitedError extends DomainError {
  constructor(message = 'Too many requests.', code = '') {
    super(message, code);
  }
}
