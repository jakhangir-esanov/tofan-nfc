import { LocalizedText } from '@shared/models/localized-text';

export abstract class DomainError extends Error {
  readonly code: string;
  readonly messages: LocalizedText | undefined;

  protected constructor(message: string, code = '', messages?: LocalizedText) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.messages = messages;
  }
}
