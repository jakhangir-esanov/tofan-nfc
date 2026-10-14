export const SUPPORTED_LOCALES = ['uz', 'ru', 'en'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const SOURCE_LOCALE: AppLocale = 'uz';

export function toAppLocale(localeId: string): AppLocale {
  const candidate = localeId.slice(0, 2);
  return SUPPORTED_LOCALES.find((locale) => locale === candidate) ?? SOURCE_LOCALE;
}

export function localizedUrl(pathname: string, target: AppLocale): string {
  const withoutPrefix = stripLocalePrefix(pathname);
  return target === SOURCE_LOCALE ? withoutPrefix : `/${target}${withoutPrefix}`;
}

function stripLocalePrefix(pathname: string): string {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname === `/${locale}`) {
      return '/';
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname.length === 0 ? '/' : pathname;
}
