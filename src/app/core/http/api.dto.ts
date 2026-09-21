export enum ErrorType {
  Failure = 0,
  Validation = 1,
  Problem = 2,
  NotFound = 3,
  Conflict = 4,
}

export interface ApiError {
  code: string;
  message: string;
  type: ErrorType;
}

export type Query = Readonly<Record<string, string | number | boolean | undefined>>;
