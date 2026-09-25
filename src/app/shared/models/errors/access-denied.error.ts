import { LocalizedText } from '@shared/models/localized-text';
import { DomainError } from './domain.error';

export class AccessDeniedError extends DomainError {
  constructor(message = 'Access is denied.', code = '', messages?: LocalizedText) {
    super(message, code, messages);
  }
}
