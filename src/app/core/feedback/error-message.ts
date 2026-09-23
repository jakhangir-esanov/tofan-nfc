import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { DomainError } from '@shared/models/errors/domain.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { RateLimitedError } from '@shared/models/errors/rate-limited.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { SessionExpiredError } from '@core/auth/session-expired.error';

const MESSAGES_BY_CODE: Readonly<Record<string, string>> = {
  'Garment.AlreadyClaimed': $localize`:@@error.garment.alreadyClaimed:Bu futbolka allaqachon aktivatsiya qilingan.`,
  'Garment.NotFound': $localize`:@@error.garment.notFound:Bu havola bo'yicha futbolka topilmadi.`,
  'Garment.UnsupportedScanResponse': $localize`:@@error.garment.unsupportedResponse:Saytni yangilash kerak. Sahifani qaytadan yuklang.`,
  'Garment.NotAvailable': $localize`:@@error.garment.notAvailable:Bu futbolka hozir mavjud emas. Qo'llab-quvvatlash xizmatiga murojaat qiling.`,
  'Authentication.InvalidCredentials': $localize`:@@error.auth.invalidCredentials:Login yoki parol noto'g'ri.`,
  'IdentityProvider.Conflict': $localize`:@@error.auth.userExists:Bu email bilan akkaunt allaqachon mavjud.`,
  'IdentityProvider.UserAlreadyExists': $localize`:@@error.auth.userExists:Bu email bilan akkaunt allaqachon mavjud.`,
};

export function toErrorMessage(error: unknown): string {
  if (!(error instanceof DomainError)) {
    return genericMessage();
  }

  const byCode = MESSAGES_BY_CODE[error.code];
  return byCode ?? messageForClass(error);
}

function messageForClass(error: DomainError): string {
  if (error instanceof InvalidCredentialsError) {
    return $localize`:@@error.auth.invalidCredentials.fallback:Login yoki parol noto'g'ri.`;
  }
  if (error instanceof SessionExpiredError) {
    return $localize`:@@error.session.expired:Sessiya tugadi. Iltimos, qaytadan kiring.`;
  }
  if (error instanceof AccessDeniedError) {
    return $localize`:@@error.accessDenied:Bu ma'lumotni ko'rishga ruxsat yo'q.`;
  }
  if (error instanceof NotFoundError) {
    return $localize`:@@error.notFound:Ma'lumot topilmadi.`;
  }
  if (error instanceof ConflictError) {
    return $localize`:@@error.conflict:Bu amalni bajarib bo'lmadi.`;
  }
  if (error instanceof RateLimitedError) {
    return $localize`:@@error.rateLimited:Juda ko'p urinish. Biroz kutib, qaytadan urinib ko'ring.`;
  }
  if (error instanceof ValidationError || error instanceof BusinessRuleError) {
    return error.message.length > 0 ? error.message : genericMessage();
  }
  return genericMessage();
}

function genericMessage(): string {
  return $localize`:@@error.generic:Ulanishda muammo. Qaytadan urinib ko'ring.`;
}
