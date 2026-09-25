import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { SessionExpiredError } from '@core/auth/session-expired.error';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { DomainError } from '@shared/models/errors/domain.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { RateLimitedError } from '@shared/models/errors/rate-limited.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { LocalizedText } from '@shared/models/localized-text';
import { ApiError, ErrorType } from './api.dto';

interface ProblemDetails {
  title?: string;
  detail?: string;
  messages?: LocalizedText;
  errors?: ApiError[];
}

export function toDomainError(error: unknown): DomainError {
  if (error instanceof DomainError) {
    return error;
  }
  if (!(error instanceof HttpErrorResponse)) {
    return new ServiceUnavailableError();
  }
  return fromHttpError(error);
}

function fromHttpError(error: HttpErrorResponse): DomainError {
  const problem = toProblemDetails(error.error);
  const code = problem.title ?? '';
  const message = problem.detail ?? error.message;
  const messages = problem.messages;

  switch (error.status) {
    case HttpStatusCode.BadRequest:
      return problem.errors === undefined
        ? new BusinessRuleError(message, code, messages)
        : new ValidationError(message, toIssues(problem.errors), code, messages);
    case HttpStatusCode.Unauthorized:
      return new SessionExpiredError();
    case HttpStatusCode.Forbidden:
      return new AccessDeniedError(message, code, messages);
    case HttpStatusCode.NotFound:
      return new NotFoundError(message, code, messages);
    case HttpStatusCode.Conflict:
      return new ConflictError(message, code, messages);
    case HttpStatusCode.TooManyRequests:
      return new RateLimitedError(message, code, messages);
    default:
      return new ServiceUnavailableError(message, '', messages);
  }
}

export function toDomainErrorFromApiError(error: ApiError | undefined): DomainError {
  const code = error?.code ?? '';
  const message = error?.message ?? '';
  const messages = error?.messages;

  switch (error?.type) {
    case ErrorType.Validation:
      return new ValidationError(message, [], code, messages);
    case ErrorType.NotFound:
      return new NotFoundError(message, code, messages);
    case ErrorType.Conflict:
      return new ConflictError(message, code, messages);
    case ErrorType.Problem:
      return new BusinessRuleError(message, code, messages);
    default:
      return new ServiceUnavailableError(message);
  }
}

function toProblemDetails(body: unknown): ProblemDetails {
  return typeof body === 'object' && body !== null ? (body as ProblemDetails) : {};
}

function toIssues(errors: ApiError[]): ValidationIssue[] {
  return errors.map(({ code, message, messages }) => ({ code, message, messages }));
}
