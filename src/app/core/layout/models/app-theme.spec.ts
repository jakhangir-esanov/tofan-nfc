import { describe, expect, it } from 'vitest';
import { oppositeOf, toAppTheme } from './app-theme';

describe('toAppTheme', () => {
  it('should keep the stored theme when it is a known one', () => {
    expect(toAppTheme('light')).toBe('light');
  });

  it('should fall back to dark when nothing or something unknown is stored', () => {
    expect(toAppTheme(null)).toBe('dark');
    expect(toAppTheme('sepia')).toBe('dark');
  });
});

describe('oppositeOf', () => {
  it('should name the other theme when one is given', () => {
    expect(oppositeOf('dark')).toBe('light');
    expect(oppositeOf('light')).toBe('dark');
  });
});
