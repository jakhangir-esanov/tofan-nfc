import { AuthSession } from './auth-session';
import { UserProfile } from './user-profile';
import type { AuthTokenResponse } from './auth.dto';
import { decodeJwtPayload } from './jwt';

const MILLISECONDS_IN_SECOND = 1000;

export function toAuthSession(
  response: AuthTokenResponse,
  issuedAt: Date = new Date(),
): AuthSession {
  return new AuthSession(
    response.accessToken,
    addSeconds(issuedAt, response.expiresIn),
    response.refreshToken,
    addSeconds(issuedAt, response.refreshExpiresIn),
  );
}

export function toUserProfile(session: AuthSession): UserProfile {
  const claims = decodeJwtPayload(session.accessToken) ?? {};
  const username = readString(claims['preferred_username']) ?? '';

  return new UserProfile(
    readString(claims['sub']) ?? '',
    username,
    readString(claims['name']) ?? username,
  );
}

function addSeconds(moment: Date, seconds: number): Date {
  return new Date(moment.getTime() + seconds * MILLISECONDS_IN_SECOND);
}

function readString(claim: unknown): string | null {
  return typeof claim === 'string' && claim.length > 0 ? claim : null;
}
