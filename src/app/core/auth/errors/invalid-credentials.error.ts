import { DomainError } from '@shared/models/errors/domain.error';

export class InvalidCredentialsError extends DomainError {
  constructor(message = 'The credentials are invalid.') {
    super(message);
  }
}
