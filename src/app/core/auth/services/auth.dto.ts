export interface AuthTokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  tokenType: string;
  idToken?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export enum GenderDto {
  Male = 1,
  Female = 2,
}

export interface CreateProfileRequest {
  firstName: string;
  lastName: string;
  userName: string;
  dateOfBirth?: string | null;
  gender: GenderDto;
  profilePhotoUrl?: string | null;
  countryCode: string;
  timeZone: string;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
}
