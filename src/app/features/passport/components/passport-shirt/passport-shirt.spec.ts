import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Passport } from '../../models/passport';
import { PassportShirt } from './passport-shirt';

const passport: Passport = {
  garment: {
    serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
    dropName: 'Drop 1',
    editionNumber: 349,
    dropTotalQuantity: 500,
    variantName: 'Peaktofan Classic',
    imageUrl: null,
    color: 'Qora',
    size: 'L',
    material: '95% paxta',
    manufacturedAt: new Date('2026-08-14T00:00:00Z'),
    knownColor: 'black',
    shade: 'var(--app-shirt-black)',
  },
  holder: { firstName: 'Jahongir', lastName: 'Esanov' },
  activatedAt: new Date('2026-10-01T00:00:00Z'),
  expiresAt: new Date('2026-12-01T00:00:00Z'),
  isExpired: false,
  standing: null,
};

function render(value: Passport, now: Date): HTMLElement {
  const fixture = TestBed.createComponent(PassportShirt);
  fixture.componentRef.setInput('passport', value);
  fixture.componentRef.setInput('now', now);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

function barWidthOf(host: HTMLElement): string {
  return host.querySelector<HTMLElement>('.validity__bar i')?.style.width ?? '';
}

describe('PassportShirt', () => {
  it('should show the days left until the expiry date when the passport is valid', () => {
    const host = render(passport, new Date('2026-10-12T00:00:00Z'));

    expect(host.textContent).toContain('50 kun qoldi');
    expect(host.textContent).not.toContain('Muddati tugagan');
  });

  it('should show the shirt as registered with its dates when it belongs to the owner', () => {
    const text = render(passport, new Date('2026-10-12T00:00:00Z')).textContent ?? '';

    expect(text).toContain("Ro'yxatdan o'tgan");
    expect(text).toContain('01.12.2026');
  });

  it('should say expired with a full bar when the server marked the passport expired', () => {
    const host = render({ ...passport, isExpired: true }, new Date('2026-10-12T00:00:00Z'));

    expect(host.textContent).toContain('Muddati tugagan');
    expect(host.textContent).not.toContain('kun qoldi');
    expect(barWidthOf(host)).toBe('100%');
  });

  it('should not call the passport expired when only the device clock is past the date', () => {
    const host = render(passport, new Date('2027-03-01T00:00:00Z'));

    expect(host.textContent).not.toContain('Muddati tugagan');
    expect(host.textContent).toContain('0 kun qoldi');
  });
});
