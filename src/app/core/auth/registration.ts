export interface Registration {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string | null;
  readonly password: string;
}

export function toUsername(registration: Registration): string {
  return registration.email.trim().toLowerCase();
}
