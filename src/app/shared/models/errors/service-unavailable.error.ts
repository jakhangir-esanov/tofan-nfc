import { LocalizedText } from '@shared/models/localized-text';
import { DomainError } from './domain.error';

export class ServiceUnavailableError extends DomainError {
  constructor(message = 'The service is unavailable.', code = '', messages?: LocalizedText) {
    super(message, code, messages);
  }
}
