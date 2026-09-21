import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { AuthSession } from './auth-session';
import { UserProfile } from './user-profile';
import { InvalidCredentialsError } from './invalid-credentials.error';
import { SessionExpiredError } from './session-expired.error';
import { Registration, toUsername } from './registration';
import {
  AuthTokenResponse,
  CreateProfileRequest,
  Gender,
  LoginRequest,
  ProfileResponse,
  RefreshTokenRequest,
  RegisterRequest,
} from './auth.dto';
import { toAuthSession, toUserProfile } from './auth.mapper';

const INVALID_CREDENTIALS_CODE = 'Authentication.InvalidCredentials';
const INVALID_REFRESH_TOKEN_CODE = 'Authentication.InvalidRefreshToken';
const DEFAULT_COUNTRY_CODE = 'UZ';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiClient = inject(ApiClient);

  async login(username: string, password: string): Promise<AuthSession> {
    const body: LoginRequest = { username: username.trim(), password };
    try {
      const token = await this.apiClient.postAnonymously<AuthTokenResponse>('/auth/login', body);
      return toAuthSession(token);
    } catch (error) {
      throw hasCode(error, INVALID_CREDENTIALS_CODE) ? new InvalidCredentialsError() : error;
    }
  }

  async register(registration: Registration): Promise<AuthSession> {
    const body: RegisterRequest = {
      username: toUsername(registration),
      email: registration.email.trim(),
      password: registration.password,
    };
    if (registration.phoneNumber !== null) {
      body.phoneNumber = registration.phoneNumber;
    }
    const token = await this.apiClient.postAnonymously<AuthTokenResponse>('/auth/register', body);
    return toAuthSession(token);
  }

  createProfile(registration: Registration, timeZone: string): Promise<void> {
    const body: CreateProfileRequest = {
      firstName: registration.firstName.trim(),
      lastName: registration.lastName.trim(),
      userName: toUsername(registration),
      gender: Gender.Unspecified,
      countryCode: DEFAULT_COUNTRY_CODE,
      timeZone,
    };
    return this.apiClient.post('/profiles', body);
  }

  async findProfile(): Promise<ProfileResponse | null> {
    try {
      return await this.apiClient.get<ProfileResponse>('/profiles');
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async renew(session: AuthSession): Promise<AuthSession> {
    if (session.refreshToken === null) {
      throw new SessionExpiredError();
    }

    try {
      const body: RefreshTokenRequest = { refreshToken: session.refreshToken };
      const token = await this.apiClient.postAnonymously<AuthTokenResponse>('/auth/refresh', body);
      return toAuthSession(token);
    } catch (error) {
      throw hasCode(error, INVALID_REFRESH_TOKEN_CODE) ? new SessionExpiredError() : error;
    }
  }

  async revoke(session: AuthSession): Promise<void> {
    if (session.refreshToken === null) {
      return;
    }
    const body: RefreshTokenRequest = { refreshToken: session.refreshToken };
    await this.apiClient.post('/auth/logout', body).catch(keepSigningOutWhenBackendIsUnreachable);
  }

  readProfile(session: AuthSession): UserProfile {
    return toUserProfile(session);
  }
}

function hasCode(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function keepSigningOutWhenBackendIsUnreachable(): void {
  return;
}
