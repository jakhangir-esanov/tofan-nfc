import { DomainError } from './domain.error';

export class BusinessRuleError extends DomainError {
  constructor(message: string, code = '') {
    super(message, code);
  }
}
