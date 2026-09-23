export const GENDERS = ['male', 'female'] as const;
export type Gender = (typeof GENDERS)[number];

export interface Registration {
  readonly firstName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly email: string;
  readonly phoneNumber: string | null;
  readonly password: string;
}

export function toUsername(registration: Registration): string {
  return registration.email.trim().toLowerCase();
}
