export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split('.')[1];
  if (payload === undefined) {
    return null;
  }

  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const decoded: unknown = JSON.parse(decodeUtf8(json));
    return typeof decoded === 'object' && decoded !== null
      ? (decoded as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function decodeUtf8(binary: string): string {
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
