import { LocalizedText } from '@shared/models/localized-text';
import { DomainError } from './domain.error';

export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly messages?: LocalizedText;
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    readonly issues: readonly ValidationIssue[] = [],
    code = '',
    messages?: LocalizedText,
  ) {
    super(message, code, messages);
  }
}
