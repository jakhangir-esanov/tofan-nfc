import { LocalizedText } from '@shared/models/localized-text';
import { DomainError } from './domain.error';

export class RateLimitedError extends DomainError {
  constructor(message = 'Too many requests.', code = '', messages?: LocalizedText) {
    super(message, code, messages);
  }
}
