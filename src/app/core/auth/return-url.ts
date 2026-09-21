import { AppPaths } from '@core/config/app-paths';

export function safeReturnUrl(candidate: string | null): string {
  if (candidate === null || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return AppPaths.home;
  }
  return candidate;
}
