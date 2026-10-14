const DAY_IN_MS = 86_400_000;

export interface Validity {
  readonly daysLeft: number;
  readonly elapsedShare: number;
}

export function validityOf(activatedAt: Date, expiresAt: Date, now: Date): Validity {
  const total = expiresAt.getTime() - activatedAt.getTime();
  const remaining = expiresAt.getTime() - now.getTime();
  return {
    daysLeft: Math.max(0, Math.ceil(remaining / DAY_IN_MS)),
    elapsedShare: total <= 0 ? 1 : Math.min(1, Math.max(0, 1 - remaining / total)),
  };
}
