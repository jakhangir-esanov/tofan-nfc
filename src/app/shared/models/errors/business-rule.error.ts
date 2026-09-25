import { LocalizedText } from '@shared/models/localized-text';
import { DomainError } from './domain.error';

export class BusinessRuleError extends DomainError {
  constructor(message: string, code = '', messages?: LocalizedText) {
    super(message, code, messages);
  }
}
