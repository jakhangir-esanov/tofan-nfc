import { DomainError } from './domain.error';

export class ConflictError extends DomainError {
  constructor(message: string, code = '') {
    super(message, code);
  }
}
