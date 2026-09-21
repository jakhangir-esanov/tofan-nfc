import { AppPaths } from '@core/config/app-paths';
import { ScanScreen, ScanState, screenFor } from './garment-scan';

const URL_BY_SCREEN: Readonly<Record<ScanScreen, (token: string) => string>> = {
  scan: AppPaths.scan,
  activate: AppPaths.activate,
  passport: AppPaths.passport,
  verify: AppPaths.verify,
};

export function scanRoute(state: ScanState, token: string): string {
  return URL_BY_SCREEN[screenFor(state)](token);
}
