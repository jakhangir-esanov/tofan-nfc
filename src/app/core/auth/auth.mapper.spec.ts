import { describe, expect, it } from 'vitest';
import { AuthSession } from './auth-session';
import { AuthTokenResponse, GenderDto } from './auth.dto';
import { toAuthSession, toCreateProfileRequest, toUserProfile } from './auth.mapper';
import { Registration } from './registration';

function tokenWith(claims: Record<string, unknown>): string {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${payload}.signature`;
}

const response: AuthTokenResponse = {
  accessToken: tokenWith({
    sub: 'user-1',
    preferred_username: 'jahongir',
    name: 'Jahongir Esanov',
  }),
  expiresIn: 3600,
  refreshToken: 'refresh',
  refreshExpiresIn: 86400,
  tokenType: 'Bearer',
};

describe('toAuthSession', () => {
  it('should turn the lifetimes into absolute moments from the issue time', () => {
    const issuedAt = new Date('2026-09-21T10:00:00Z');

    const session = toAuthSession(response, issuedAt);

    expect(session.expiresAt).toEqual(new Date('2026-09-21T11:00:00Z'));
    expect(session.refreshExpiresAt).toEqual(new Date('2026-09-22T10:00:00Z'));
  });

  it('should report the session as usable while the access token is alive', () => {
    const session = toAuthSession(response, new Date('2026-09-21T10:00:00Z'));

    expect(session.isExpired(new Date('2026-09-21T10:30:00Z'))).toBe(false);
    expect(session.isUsable(new Date('2026-09-21T10:30:00Z'))).toBe(true);
  });

  it('should still be usable after the access token expired while the refresh token lives', () => {
    const session = toAuthSession(response, new Date('2026-09-21T10:00:00Z'));

    expect(session.isExpired(new Date('2026-09-21T12:00:00Z'))).toBe(true);
    expect(session.isUsable(new Date('2026-09-21T12:00:00Z'))).toBe(true);
  });
});

describe('toUserProfile', () => {
  it('should read the identity from the access token claims', () => {
    const profile = toUserProfile(toAuthSession(response));

    expect(profile.id).toBe('user-1');
    expect(profile.username).toBe('jahongir');
    expect(profile.fullName).toBe('Jahongir Esanov');
  });

  it('should fall back to the username when the token carries no display name', () => {
    const token = tokenWith({ sub: 'user-1', preferred_username: 'jahongir' });

    const profile = toUserProfile(new AuthSession(token, new Date()));

    expect(profile.fullName).toBe('jahongir');
  });

  it('should return empty identity fields when the token cannot be read', () => {
    const profile = toUserProfile(new AuthSession('not-a-token', new Date()));

    expect(profile.id).toBe('');
    expect(profile.username).toBe('');
  });
});

describe('toCreateProfileRequest', () => {
  const registration: Registration = {
    firstName: ' Jahongir ',
    lastName: ' Esanov ',
    gender: 'female',
    email: ' Jahongir@Example.com ',
    phoneNumber: null,
    password: 'Passw0rd!23',
  };

  it('should send the chosen gender as the backend enum when the profile is created', () => {
    expect(toCreateProfileRequest(registration, 'Asia/Tashkent').gender).toBe(GenderDto.Female);
    expect(
      toCreateProfileRequest({ ...registration, gender: 'male' }, 'Asia/Tashkent').gender,
    ).toBe(GenderDto.Male);
  });

  it('should trim the names and derive the username from the email when the profile is created', () => {
    expect(toCreateProfileRequest(registration, 'Asia/Tashkent')).toEqual({
      firstName: 'Jahongir',
      lastName: 'Esanov',
      userName: 'jahongir@example.com',
      gender: GenderDto.Female,
      countryCode: 'UZ',
      timeZone: 'Asia/Tashkent',
    });
  });
});
