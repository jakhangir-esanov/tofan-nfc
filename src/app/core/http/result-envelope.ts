import type { ApiError } from './api.dto';
import { toDomainErrorFromApiError } from './api-error.mapper';

interface ResultEnvelope {
  isSuccess: boolean;
  error?: ApiError;
  data?: unknown;
}

export function unwrapResult(body: unknown): unknown {
  if (!isResultEnvelope(body)) {
    return body;
  }
  if (!body.isSuccess) {
    throw toDomainErrorFromApiError(body.error);
  }
  return body.data;
}

function isResultEnvelope(body: unknown): body is ResultEnvelope {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Record<string, unknown>)['isSuccess'] === 'boolean'
  );
}
