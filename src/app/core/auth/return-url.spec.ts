import { describe, expect, it } from 'vitest';
import { safeReturnUrl } from './return-url';

describe('safeReturnUrl', () => {
  it('should keep the scan route when the return url is an app path', () => {
    expect(safeReturnUrl('/t/abc123/activate')).toBe('/t/abc123/activate');
  });

  it('should fall back to home when the return url is missing', () => {
    expect(safeReturnUrl(null)).toBe('/');
  });

  it('should reject an absolute url when it points to another host', () => {
    expect(safeReturnUrl('https://evil.test/steal')).toBe('/');
  });

  it('should reject a protocol relative url when it starts with two slashes', () => {
    expect(safeReturnUrl('//evil.test/steal')).toBe('/');
  });
});
