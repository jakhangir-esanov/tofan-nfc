export abstract class DomainError extends Error {
  readonly code: string;

  protected constructor(message: string, code = '') {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}
