import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { LocalizedText } from '@shared/models/localized-text';
import { toErrorMessage } from './error-message';

const PASSWORD_SHORT: LocalizedText = {
  en: 'Password is too short.',
  uz: 'Parol juda qisqa.',
  ru: 'Пароль слишком короткий.',
};
const EMAIL_INVALID: LocalizedText = {
  en: 'Email is not valid.',
  uz: "Email noto'g'ri.",
  ru: 'Неверный email.',
};

describe('toErrorMessage', () => {
  it('should keep the product wording when the code is known', () => {
    const error = new NotFoundError('gone', 'Garment.NotFound', PASSWORD_SHORT);

    expect(toErrorMessage(error, 'ru')).toContain('futbolka');
  });

  it('should show the backend text in the page language when the code is unknown', () => {
    const error = new ConflictError('exists', 'Profile.AlreadyExists', PASSWORD_SHORT);

    expect(toErrorMessage(error, 'ru')).toBe('Пароль слишком короткий.');
    expect(toErrorMessage(error, 'uz')).toBe('Parol juda qisqa.');
  });

  it('should join the issues in the page language when validation fails', () => {
    const error = new ValidationError('invalid', [
      {
        code: 'MinimumLengthValidator',
        message: 'Password is too short.',
        messages: PASSWORD_SHORT,
      },
      { code: 'EmailValidator', message: 'Email is not valid.', messages: EMAIL_INVALID },
    ]);

    expect(toErrorMessage(error, 'uz')).toBe("Parol juda qisqa. Email noto'g'ri.");
  });

  it('should fall back to the plain message of an issue when it has no translation', () => {
    const error = new ValidationError('invalid', [
      { code: 'NotEmptyValidator', message: "'Email' must not be empty." },
    ]);

    expect(toErrorMessage(error, 'ru')).toBe("'Email' must not be empty.");
  });

  it('should use the class message when the backend sent no translation', () => {
    expect(toErrorMessage(new NotFoundError('gone', 'Profile.NotFound'), 'uz')).toBe(
      "Ma'lumot topilmadi.",
    );
  });

  it('should use the generic message when the backend is unreachable', () => {
    expect(toErrorMessage(new ServiceUnavailableError(), 'en')).toBe(
      "Ulanishda muammo. Qaytadan urinib ko'ring.",
    );
  });
});
