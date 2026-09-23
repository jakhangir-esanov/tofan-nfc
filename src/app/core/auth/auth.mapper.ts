import { enumMap } from '@shared/utils/enum-map';
import { AuthSession } from './auth-session';
import { UserProfile } from './user-profile';
import { AuthTokenResponse, CreateProfileRequest, GenderDto } from './auth.dto';
import { decodeJwtPayload } from './jwt';
import { Gender, Registration, toUsername } from './registration';

const MILLISECONDS_IN_SECOND = 1000;
const DEFAULT_COUNTRY_CODE = 'UZ';

const genders = enumMap<Gender, GenderDto>(GenderDto);

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

export function toCreateProfileRequest(
  registration: Registration,
  timeZone: string,
): CreateProfileRequest {
  return {
    firstName: registration.firstName.trim(),
    lastName: registration.lastName.trim(),
    userName: toUsername(registration),
    gender: genders.toApi(registration.gender),
    countryCode: DEFAULT_COUNTRY_CODE,
    timeZone,
  };
}

function addSeconds(moment: Date, seconds: number): Date {
  return new Date(moment.getTime() + seconds * MILLISECONDS_IN_SECOND);
}

function readString(claim: unknown): string | null {
  return typeof claim === 'string' && claim.length > 0 ? claim : null;
}
